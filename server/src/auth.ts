import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { ChatUser } from './types.js'
import { pickColor } from './rooms.js'

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user as ChatUser))

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:4000/auth/google/callback',
  },
  (_at, _rt, profile, done) => {
    const user: ChatUser = {
      id:       `google_${profile.id}`,
      name:     profile.displayName,
      avatar:   profile.photos?.[0]?.value ?? '',
      color:    pickColor(profile.id),
      provider: 'google',
    }
    done(null, user)
  }
))

export default passport
