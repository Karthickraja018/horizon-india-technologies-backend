import type { Access, PayloadRequest } from 'payload'

type UserWithRoles = {
  roles?: string[] | null
}

export const isAdmin = (req: PayloadRequest): boolean => {
  const user = req.user as unknown as UserWithRoles | undefined
  return Boolean(user?.roles?.includes('admin'))
}

export const adminsOnly: Access = ({ req }) => isAdmin(req)

