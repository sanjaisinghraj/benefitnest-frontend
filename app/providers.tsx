"use client";
import React from "react";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
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
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
