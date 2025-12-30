import { proxy } from './app-proxy'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return proxy(request)
}

export { config } from './app-proxy'
