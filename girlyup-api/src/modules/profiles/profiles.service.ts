// ─── Imports ──────────────────────────────────────────────────────────────────

// Le client Supabase qu'on a configuré dans db/client.ts
// C'est lui qui fait les vraies requêtes vers la base de données
import { supabase } from '../../db/client.js'

// Le type TypeScript pour les données de mise à jour
// Importé depuis le schéma Zod qu'on vient de créer
import type { UpdateProfileInput } from './profiles.schema.js'

// v2 = version 2 du SDK Cloudinary
// UploadApiResponse = type TypeScript de la réponse Cloudinary
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'

// Readable = classe Node.js pour créer un flux de données lisible
// Utilisé pour convertir un Buffer (données brutes) en stream
// Cloudinary préfère les streams aux fichiers pour les uploads
import { Readable } from 'stream'

// ─── Récupérer son propre profil ──────────────────────────────────────────────

// userId = l'ID de l'utilisatrice connectée (extrait du JWT)
export async function getMyProfile(userId: string) {

  // supabase.from('profiles') = on interroge la table "profiles"
  // .select('*') = on veut toutes les colonnes
  // .eq('user_id', userId) = WHERE user_id = userId
  // .single() = on attend exactement 1 résultat (pas un tableau)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Si Supabase retourne une erreur, on la propage
  if (error) throw new Error(error.message)

  // On retourne le profil trouvé
  return data
}

// ─── Mettre à jour son profil ─────────────────────────────────────────────────

export async function updateMyProfile(userId: string, input: UpdateProfileInput) {

  // On prépare l'objet de mise à jour
  // On mappe les noms TypeScript (camelCase) vers les noms SQL (snake_case)
  // Ex: displayName → display_name (convention PostgreSQL)
  const updates: Record<string, any> = {}

  // Pour chaque champ, on ne l'ajoute que s'il est présent dans la requête
  // Ainsi un champ absent ne remplace pas la valeur existante en base
  if (input.displayName !== undefined) updates.display_name = input.displayName
  if (input.bio        !== undefined) updates.bio           = input.bio
  if (input.city       !== undefined) updates.city          = input.city
  if (input.interests  !== undefined) updates.interests     = input.interests

  // .update(updates) = met à jour les colonnes spécifiées
  // .eq('user_id', userId) = WHERE user_id = userId (sécurité : seul son propre profil)
  // .select().single() = retourne le profil mis à jour
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  return data
}

// ─── Uploader une photo de profil ─────────────────────────────────────────────

// buffer = les données brutes du fichier image (octets)
// mimetype = le type MIME du fichier ex: 'image/jpeg', 'image/png'
// userId = pour nommer le fichier de façon unique sur Cloudinary
export async function uploadProfilePhoto(
  buffer: Buffer,
  mimetype: string,
  userId: string
): Promise<string> {

  // On retourne une Promise car l'upload est asynchrone
  return new Promise((resolve, reject) => {

    // cloudinary.uploader.upload_stream = upload depuis un stream
    // Plus efficace que sauvegarder le fichier sur le disque puis l'uploader
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        // folder = dossier dans Cloudinary où stocker la photo
        folder: 'girlyup/profiles',

        // public_id = nom unique du fichier dans Cloudinary
        // On utilise l'userId pour écraser l'ancienne photo si elle existe
        public_id: `user_${userId}`,

        // overwrite = true permet de remplacer une photo existante
        overwrite: true,

        // transformation = instructions de redimensionnement automatique
        // width/height : redimensionner en 400x400 pixels
        // crop: 'fill' : rogner pour remplir exactement 400x400
        // gravity: 'face' : centrer le rognage sur le visage détecté
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        ],
      },
      // Callback appelé quand l'upload est terminé
      // error = null si succès, sinon contient l'erreur
      // result = réponse Cloudinary avec l'URL de l'image
      (error, result: UploadApiResponse | undefined) => {
        if (error) {
          // Upload échoué → on rejette la Promise
          reject(new Error(error.message))
        } else if (result) {
          // Upload réussi → on retourne l'URL sécurisée (HTTPS)
          // secure_url = URL HTTPS de l'image sur le CDN Cloudinary
          resolve(result.secure_url)
        }
      }
    )

    // On convertit le Buffer en Readable stream
    // Readable.from(buffer) = crée un stream lisible depuis des données en mémoire
    // .pipe(uploadStream) = envoie les données vers Cloudinary
    Readable.from(buffer).pipe(uploadStream)
  })
}

// ─── Ajouter une URL photo dans le profil en base ────────────────────────────

export async function addPhotoToProfile(userId: string, photoUrl: string) {

  // D'abord on récupère les photos existantes
  const { data: profile } = await supabase
    .from('profiles')
    .select('photos')
    .eq('user_id', userId)
    .single()

  // On récupère le tableau actuel ou un tableau vide si aucune photo
  const currentPhotos: string[] = profile?.photos ?? []

  // On ajoute la nouvelle URL au tableau
  // [...currentPhotos, photoUrl] = spread operator qui crée un nouveau tableau
  // avec toutes les photos existantes + la nouvelle
  const updatedPhotos = [...currentPhotos, photoUrl]

  // On met à jour le profil avec le nouveau tableau de photos
  const { data, error } = await supabase
    .from('profiles')
    .update({ photos: updatedPhotos })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  return data
}