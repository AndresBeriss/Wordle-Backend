export default interface TokenPayload {
  userId: number;
  name: string;
  accessTypes: string[];
  exp?: number;
}
