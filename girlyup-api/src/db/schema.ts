import { pgTable, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:             uuid('id').primaryKey().defaultRandom(),
  email:          text('email').notNull().unique(),
  passwordHash:   text('password_hash').notNull(),
  gender:         text('gender').notNull().default('female'),
  genderVerified: boolean('gender_verified').notNull().default(false),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
  updatedAt:      timestamp('updated_at').notNull().defaultNow(),
})

export const profiles = pgTable('profiles', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  displayName: text('display_name').notNull(),
  birthYear:   integer('birth_year').notNull(),
  bio:         text('bio'),
  city:        text('city'),
  interests:   text('interests').array().notNull().default([]),
  photos:      text('photos').array().notNull().default([]),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

export type User       = typeof users.$inferSelect
export type NewUser    = typeof users.$inferInsert
export type Profile    = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert