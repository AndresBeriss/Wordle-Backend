import { Response, Request, NextFunction } from "express";
import { validateToken } from "../utils/jwt";

const authorize =
  (accessTypes: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let jwt = req.headers.authorization;

      if (!jwt) {
        return res.status(401).json({ message: "Token inválido" });
      }

      if (jwt.toLowerCase().startsWith("bearer")) {
        jwt = jwt.slice("bearer".length).trim();
      }

      const decodedToken = await validateToken(jwt);
      const hasAccessToEndpoint = accessTypes.some((at) =>
        decodedToken.accessTypes.some((uat) => uat === at)
      );

      if (!hasAccessToEndpoint) {
        return res
          .status(401)
          .json({ message: "No tienes acceso a esta endpoint" });
      }

      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({ message: "Token expirado" });
        return;
      }

      res.status(500).json({ message: "Error al autenticar el usuario" });
    }
  };

export { authorize };
