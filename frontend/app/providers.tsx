"use client";
import React from "react";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { SessionProvider } from "next-auth/react";
import { setContext } from "@apollo/client/link/context";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const cookieToken =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_token="))
      ?.split("=")[1] || null;
  const localToken = localStorage.getItem("admin_token");
  return cookieToken || localToken;
}

function getSessionFromToken(): any | null {
  if (typeof window === "undefined") return null;
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    const user = {
      name: payload.name || payload.username || "Administrator",
      email: payload.email || "admin@benefitnest.space",
      image: payload.image || null,
      roles: payload.roles || ["admin"],
    };
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    return { user, expires };
  } catch {
    const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    return { user: { name: "Administrator" }, expires };
  }
}

const graphqlUri =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com"}/graphql`;

const httpLink = new HttpLink({
  uri: graphqlUri,
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
      jwt: token || "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const session = typeof window !== "undefined" ? getSessionFromToken() : null;
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </SessionProvider>
  );
}
