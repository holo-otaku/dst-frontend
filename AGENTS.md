# Agent Guide: DST Frontend

This document provides essential information for AI agents operating in this repository. Follow these guidelines to ensure consistency with the existing codebase.

## 1. Development & Build Commands

The project uses **Yarn** as the package manager and **Vite** for the build pipeline.

| Task           | Command          | Description                             |
| :------------- | :--------------- | :-------------------------------------- |
| **Install**    | `yarn`           | Install dependencies                    |
| **Dev**        | `yarn dev`       | Start the development server            |
| **Build**      | `yarn build`     | Run type-check and build for production |
| **Lint**       | `yarn lint`      | Run ESLint check                        |
| **Format**     | `yarn format`    | Fix formatting with Prettier            |
| **Type-check** | `yarn typecheck` | Run TypeScript compiler check           |
| **Commit**     | `yarn commit`    | Use Commitizen for conventional commits |

### Testing

Currently, no test framework (Jest/Vitest) is configured in the root `package.json`. If you need to add tests, refer to the `vitest` documentation and integrate it into the `scripts` section.

## 2. Code Style & Conventions

### Imports

- **Order:**
  1. React and standard hooks (`react`, `react-dom`).
  2. Third-party libraries (`react-bootstrap`, `lodash`, `axios`, `moment`, `react-icons`).
  3. Context and Hooks (`../../context`, `../../hooks`).
  4. Components and Utils.
  5. Styles/Assets (`.scss`, `.css`).
- **Paths:** Use relative paths (e.g., `../../components/...`).
- **Extensions:** Omit extensions for `.ts` and `.tsx` files. Include them for `.js` and style files.

### TypeScript

- **Interfaces vs Types:** Use `interface` for object shapes and component props. Use `type` only for unions or complex mappings.
- **Strictness:** The project uses `strict: true`. Avoid using `any`; prefer generics or specific interfaces.
- **Enums:** Use `enum` for fixed sets of constants (e.g., `SeriesFieldDataType`).
- **API Types:** Use `APIResponse<T>` and `APIError` globals where applicable. Feature-specific interfaces should reside in an `Interfaces.tsx` file within the feature directory.

### Naming Conventions

- **Files:**
  - `PascalCase.tsx` for React components (e.g., `ProductTable.tsx`).
  - `camelCase.ts` for hooks and utilities (e.g., `useAuth.ts`, `parser.ts`).
  - `Interface.tsx` or `Interfaces.tsx` for feature-specific type definitions.
- **Variables/Functions:** `camelCase`.
- **Constants:** `SCREAMING_SNAKE_CASE`.
- **Components:** `PascalCase`.

### React & Components

- **Syntax:** Functional components using arrow functions.
- **Props:** Destructure props directly in the function signature.
- **Example Component Structure:**

  ```tsx
  import { Table, Button } from "react-bootstrap";
  import { FeatureData } from "./Interfaces";
  import { useContext } from "react";
  import { AuthContext } from "../../context";

  interface FeatureTableProps {
    data: FeatureData[];
    onAction: (id: number) => void;
  }

  export const FeatureTable = ({ data, onAction }: FeatureTableProps) => {
    const { getPayload } = useContext(AuthContext);
    const { permissions = [] } = getPayload();

    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                <Button
                  variant={
                    permissions.includes("feat.edit") ? "primary" : "secondary"
                  }
                  onClick={() => onAction(item.id)}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };
  ```

### Formatting (Prettier)

Defined in `.prettierrc.json`:

- `semi`: true
- `singleQuote`: false
- `trailingComma`: "es5"
- `printWidth`: 80

## 3. Architecture & Patterns

### File Organization

- `src/components/`: Organized by feature (e.g., `Series/`, `Product/`).
- `src/context/`: Contains global providers (Auth, ColorMode).
- `src/hooks/`: Reusable custom hooks (e.g., `pagination`, `useFieldAutoComplete`).
- `src/utils/`: Pure utility functions.
- `src/routes/`: Route definitions using `react-router-dom`.

### Data Fetching & API

- **Primary tool:** `axios-hooks` for declarative fetching.
- **Manual calls:** Use the configured `axios` instance.
- **Common Pattern:**
  ```tsx
  const [{ data, loading, error }, executeFetch] = useAxios<MyResponse>(
    { url: "/api/path", method: "GET" },
    { manual: true }
  );
  ```

### Error Handling

- Use `try/catch` blocks for asynchronous operations.
- Global errors (like 401 Unauthorized) are handled via Axios interceptors in `AuthContext.tsx`.
- Log errors to the console using `console.error`.

### Styling

- **Tailwind CSS:** Preferred for layout and spacing. Use classes like `mx-1`, `mt-4`, `flex`, `justify-between`.
- **React-Bootstrap:** Used for high-level components like `Table`, `Button`, `Modal`, `Navbar`, and `NavDropdown`.
- **SCSS/CSS:** Global styles in `global.scss`.
- **Dark Mode:** Supported via `ColorModeContext`. Bootstrap components often use `bg="body-tertiary"`.

## 4. Security & Environment

- Access environment variables via `import.meta.env.VITE_API_HOST`.
- Never commit `.env` or `.env.local` files.
- Sensitive tokens should be managed via `AuthContext`.
- Always check `permissions` from `getPayload()` before rendering sensitive UI elements.
