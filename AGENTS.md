<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ui-and-components-rules -->
# UI and Component Guidelines

1. **Always use Shadcn UI:** Use Shadcn UI for all standard elements (buttons, dialogs, tables, cards, inputs, badges, etc.). Do not build custom UI primitives from scratch. 
2. **Customize Shadcn:** Customize Shadcn components directly when needed.
3. **Consistency:** Maintain extreme consistency in design and component usage across the entire app.
4. **Component Splitting:** Do not make files too heavy. Split large, complex components into multiple smaller, focused components.
5. **Reusability:** Always extract and reuse components wherever possible.
6. **Dialog Standards:** Standard Shadcn UI Dialogs must use clean native overlays (`bg-black/60 transition-opacity duration-150`), standard sub-components (`DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`), and center alignment without extra background wrappers.
7. **Universal Control Heights:** Select triggers and Input fields must maintain a universal `h-10` (`40px`) height across all forms, tables, and modals.
8. **Reusable Feedback Modals:** Use `SuccessModal` (`src/components/shared/success-modal.tsx`) for all success popups, `DeleteModal` (`src/components/shared/delete-modal.tsx`) for all delete confirmation popups, and `ArchiveModal` (`src/components/shared/archive-modal.tsx`) for all archived file notifications across the application.
<!-- END:ui-and-components-rules -->
