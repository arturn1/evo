import { prisma } from "@/lib/prisma/db"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = loginSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              doctor: true,
              patient: {
                include: {
                  doctor: true,
                },
              },
            },
          })

          if (!user) {
            return null
          }

          // Verificar se é médico e se está ativo
          if (user.userType === 'DOCTOR' && user.doctor && !user.doctor.active) {
            return null
          }

          // Verificar se é paciente e se está ativo
          if (user.userType === 'PATIENT' && user.patient && !user.patient.active) {
            return null
          }

          const isValidPassword = await bcrypt.compare(password, user.password)

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.userType,
            role: user.doctor?.role || null,
            doctorId: user.doctor?.id || null,
            patientId: user.patient?.id || null,
          }
        } catch (error) {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.userType = user.userType
        token.role = user.role
        token.doctorId = user.doctorId
        token.patientId = user.patientId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.userType = token.userType as string
        session.user.role = token.role as string | null
        session.user.doctorId = token.doctorId as string | null
        session.user.patientId = token.patientId as string | null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})
