# AI Rules for CapoCanto Application

This document outlines the technical stack and specific library usage guidelines for the CapoCanto application to ensure consistency, maintainability, and adherence to best practices.

## Tech Stack Overview

*   **Frontend Framework**: React.js for building dynamic user interfaces.
*   **Language**: TypeScript for type safety and improved code quality.
*   **Build Tool**: Vite for a fast development experience and optimized builds.
*   **Styling**: Tailwind CSS for utility-first, responsive, and highly customizable styling.
*   **Routing**: React Router DOM for declarative navigation within the application.
*   **Icons**: Lucide React for a comprehensive set of customizable SVG icons.
*   **UI Components**: Shadcn/ui for pre-built, accessible, and customizable UI components.
*   **State Management**: React Context API for managing global application state.
*   **Data Persistence**: Local Storage for client-side data storage.

## Library Usage Rules

To maintain a consistent and efficient codebase, please adhere to the following rules when developing or modifying the application:

*   **UI Components**:
    *   Prioritize using components from **shadcn/ui** for common UI elements (buttons, forms, modals, etc.).
    *   If a specific component is not available in shadcn/ui or requires significant customization that deviates from shadcn/ui's design philosophy, create a new, small, and focused custom component in `src/components/`.
    *   **Radix UI** components are underlying primitives for shadcn/ui; use them indirectly via shadcn/ui or directly only when building highly custom, accessible components from scratch.
*   **Styling**:
    *   **Always** use **Tailwind CSS** classes for all styling. Avoid inline styles or separate CSS files unless absolutely necessary for global overrides (e.g., `src/index.css`).
    *   Ensure designs are responsive by utilizing Tailwind's responsive utility classes.
*   **Icons**:
    *   Use **lucide-react** for all icons. Import specific icons as needed.
*   **Routing**:
    *   Use **React Router DOM** for all navigation. Keep route definitions centralized in `src/App.tsx`.
*   **State Management**:
    *   For application-wide state, leverage the **React Context API** (e.g., `SongContext`).
    *   For component-local state, use React's `useState` and `useReducer` hooks.
*   **Data Persistence**:
    *   For client-side data storage, use **Local Storage**.
*   **New Components/Hooks**:
    *   **Always** create a new file for every new component or hook, no matter how small.
    *   Never add new components to existing files.
    *   Aim for components that are 100 lines of code or less.
*   **Error Handling**:
    *   Do not implement `try/catch` blocks for error handling unless specifically requested. Allow errors to bubble up for easier debugging and centralized management.
*   **Code Simplicity**:
    *   Strive for simple, elegant, and minimal code changes to fulfill user requests. Avoid over-engineering with complex patterns or unnecessary abstractions.