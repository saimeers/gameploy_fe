import { useRouteError, Link } from "react-router-dom";

export default function ErrorPage() {
  // Cuando caemos en "path: '*'", error será null.
  const error = useRouteError();
  
  if (error) {
    console.error(error);
  }

  const errorMessage = error?.statusText || error?.message || "Página no encontrada (404)";

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>¡Oops! 😅</h1>
      <p>Lo sentimos, la página que buscas no existe o ha ocurrido un error.</p>
      <p>
        <i>{errorMessage}</i>
      </p>
      
      <Link to="/" style={{ marginTop: "20px", display: "inline-block" }}>
        Volver al inicio
      </Link>
    </div>
  );
}