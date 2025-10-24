
export class ApiClientError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>
  ) {
    // Llama al constructor de la clase base 'Error'
    super(message); 

    // Asigna las propiedades personalizadas
    this.name = "ApiClientError"; // Le da un nombre a tu tipo de error
    this.status = status;
    this.errors = errors;

    // Esto es necesario para que `instanceof ApiClientError` funcione
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }

  /**
   * Sobrescribe el método toString() para dar un output útil.
   */
  public override toString(): string {
    return `ApiClientError (Status ${this.status}): ${this.message}`;
  }
}
