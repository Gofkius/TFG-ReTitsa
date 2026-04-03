# Front-end Movo

Para instalar dependencias:
```
npm install
```

Para ejecutar el proyecto:
```
npx expo run
```

## Configuración del .env

Para configurar el .env tendrás que dirigirte al Clerk y pillar el public publishable key.
Este no tiene porque ser mantenido secreto y no pasa nada si se hace un leak.

EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=

## Branches del proyecto

```
master --- production
staging --- testing server
dev --- development
```

Para que un feature llegue a production el flujo sería el siguiente **(subject-to-change)**:

1. Se cree un feature en un **branch local** por separado sin publicar en git.
2. Se testea el feature en el branch local.
3. Se hace un merge al dev branch.
4. Se da el visto bueno, en caso de que no, se sugiere algun cambio y se implementa las mejoras.
5. Se pushea en staging y se va testeando en la aplicación móvil por si se encuentra algun bug en uso real.
6. Una vez resuelto los bugs, se hace el merge con master para implementarlo al servidor de production.

**NO PUSHEAR CÓDIGO GENERADO POR IA, NO ES PLAN HACER VIBECODING**

## Enlaces de interes

Libreria de componentes: 
https://ui.shadcn.com/

Auth:
https://clerk.com/

Hosting provider:
https://render.com/
