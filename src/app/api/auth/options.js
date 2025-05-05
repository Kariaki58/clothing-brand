import GoogleProvider from "next-auth/providers/google";
import User from "../../../../models/user";
import { connectToDatabase } from "@/lib/mongoose";

export const options = {
    providers: [
        GoogleProvider({
            profile: async (profile) => {
                try {
                    await connectToDatabase();

                    let userRole = "user";

                    // Check if user exists
                    let user = await User.findOne({ email: profile.email }).exec();
                    if (!user) {
                        // Create new user
                        user = await User.create({
                            name: profile.name,
                            email: profile.email,
                            googleId: profile.sub,
                            avatar: profile.picture,
                            role: userRole,
                        });
                    }

                    return {
                        ...profile,
                        id: user._id.toString(),
                        role: user.role,
                        avatar: user.avatar,
                    };
                } catch (error) {
                    return null;
                }
            },
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user){
                token.role = user.role;
                token.id = user.id;
                token.avatar = user.avatar;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.avatar = token.avatar;
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
};