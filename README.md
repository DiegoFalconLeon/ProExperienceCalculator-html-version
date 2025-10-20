# Calculadora de Experiencia Laboral

![Calculadora de Experiencia Laboral](https://img.shields.io/badge/Estado-Completo-green.svg)
![Licencia](https://img.shields.io/badge/Licencia-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

Una aplicacion web moderna y responsiva diseñada para calcular la experiencia laboral profesional de manera sencilla. Esta herramienta ayuda a los usuarios a rastrear tanto la experiencia especifica como la general de carrera a traves de una interfaz intuitiva de tabla dual con sincronizacion automatica.

## Caracteristicas

- Sistema de Tabla Dual: Tablas separadas para el seguimiento de experiencia especifica y general
- Sincronizacion Automatica: La experiencia de la tabla especifica aparece automaticamente en la tabla general
- Estilo Profesional: Marca corporativa con esquema de color personalizado (#20c5bf → #7543e9)
- Diseno Responsivo: Optimizado para escritorio, tablet y dispositivos moviles
- Interacciones Inteligentes: Visibilidad inteligente de botones y confirmaciones amigables para el usuario
- Integracion SweetAlert: Dialogos modales hermosos para acciones del usuario
- Validacion de Datos: Calculo en tiempo real y validacion de entrada
- Interfaz Limpia: Interfaz moderna con animaciones suaves y efectos hover
- Internacionalizacion: Soporte completo para español e ingles con selector de idioma

## Internacionalizacion (i18n)

La aplicacion incluye soporte completo de internacionalizacion:

- **Idiomas Soportados**: Español e Ingles
- **Selector de Idioma**: Ubicado en la parte superior derecha del encabezado
- **Persistencia**: La preferencia de idioma se guarda automaticamente en localStorage
- **Traducciones Completas**: Todos los textos de la interfaz, mensajes y confirmaciones
- **Cambio Dinamico**: Cambie de idioma sin recargar la pagina

## Demo en Vivo

[Ver en vivo en GitHub Pages](https://diegofalconleon.github.io/ProExperienceCalculator-html-version/)

## Tecnologias Utilizadas

- HTML5 - Marcado semantico y estructura con atributos data-i18n
- CSS3 - Estilo moderno con gradientes, animaciones y diseno responsivo
- JavaScript Vanilla - Manipulacion DOM, logica de negocio e internacionalizacion
- SweetAlert2 - Dialogos modales hermosos y notificaciones
- JSON - Archivos de traducciones para internacionalizacion
- localStorage - Persistencia de la preferencia de idioma

## Prerrequisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexion a internet para el CDN de SweetAlert2

## Uso

1. Abra la aplicacion en su navegador web
2. **Selector de Idioma** (esquina superior derecha):
   - Seleccione "Español" o "English" del menu desplegable
   - La interfaz cambiara automaticamente al idioma seleccionado
   - La preferencia se guarda automaticamente para futuras visitas
3. Tabla de Experiencia Especifica:
   - Agregue periodos de trabajo con fechas de inicio y fin
   - La calculadora calcula automaticamente la duracion de cada entrada
   - Vea el total de experiencia especifica en la parte superior
4. Tabla de Experiencia General:
   - Sincronizada automaticamente con la experiencia especifica
   - Agregue periodos adicionales de experiencia general
   - Vea el total de experiencia combinada
5. Caracteristicas Inteligentes:
   - El boton "Limpiar Campos" aparece solo cuando existen datos
   - Dialogos de confirmacion para acciones destructivas
   - Diseno responsivo se adapta al tamano de pantalla

## Estructura del Proyecto

```
professional-experience-calculator/
│
├── index.html                    # Archivo principal de la aplicacion
│   ├── Selector de Idioma        # Cambiador de idioma (ES/EN)
│   ├── Seccion de Encabezado     # Logo y titulo
│   ├── Tablas de Experiencia     # Sistema de tabla dual
│   ├── Pie de Pagina            # Creditos del autor
│   └── Scripts                   # Funcionalidad JavaScript
│
├── assets/
│   ├── css/
│   │   └── styles.css           # Estilos de la aplicacion
│   ├── js/
│   │   └── script.js            # Logica de la aplicacion con i18n
│   └── img/
│       ├── logo.png             # Logo de la empresa
│       └── logo.ico             # Favicon
│
├── lang/
│   ├── es.json                  # Traducciones al español
│   └── en.json                  # Traducciones al ingles
│
└── README.md                    # Documentacion del proyecto
```

## Paleta de Colores

La aplicacion utiliza una paleta de colores corporativos profesionales:
- Gradiente Primario: `#20c5bf` → `#7543e9`
- Color de Acento: `#20c5bf` (Verde Azulado)
- Color Secundario: `#7543e9` (Purpura)
- Fondo: `#f5f5f5` (Gris Claro)
- Texto: `#1f2937` (Gris Oscuro)

## Responsive

- Escritorio: > 768px
- Tablet: 768px - 480px
- Movil: < 480px

## Licencia

Este proyecto esta licenciado bajo la Licencia MIT - vea el archivo [LICENSE](https://github.com/DiegoFalconLeon/ProExperienceCalculator-html-version?tab=GPL-3.0-1-ov-file) para mas detalles.

## Autor

Diego Falcón León
- LinkedIn: [diego-falcon-leon](https://www.linkedin.com/in/diego-falcon-leon/)
- Contacto: +5198489210

## Agradecimientos

- SweetAlert2 por los dialogos modales hermosos
- Google Fonts por la inspiracion tipografica
- La comunidad de codigo abierto por la inspiracion



Hecho con ❤️ por Diego Falcón León

Calcule su experiencia profesional con precision y estilo!</content>

---

# Professional Experience Calculator

![Professional Experience Calculator](https://img.shields.io/badge/Status-Complete-green.svg)
![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

A modern, responsive web application designed to calculate professional work experience easily. This tool helps users track both specific and general career experience through an intuitive dual-table interface with automatic synchronization.

## Features

- Dual Table System: Separate tables for specific and general experience tracking
- Automatic Synchronization: Experience from specific table automatically appears in general table
- Professional Styling: Corporate branding with custom color scheme (#20c5bf → #7543e9)
- Responsive Design: Optimized for desktop, tablet, and mobile devices
- Smart Interactions: Intelligent button visibility and user-friendly confirmations
- SweetAlert Integration: Beautiful modal dialogs for user actions
- Data Validation: Real-time calculation and input validation
- Clean UI: Modern interface with smooth animations and hover effects
- Internationalization: Complete support for Spanish and English with language selector

## Internationalization (i18n)

The application includes complete internationalization support:

- **Supported Languages**: Spanish and English
- **Language Selector**: Located in the top right corner of the header
- **Persistence**: Language preference is automatically saved in localStorage
- **Complete Translations**: All interface texts, messages, and confirmations
- **Dynamic Change**: Change language without reloading the page

## Repository

[View live on GitHub Pages](https://diegofalconleon.github.io/ProExperienceCalculator-html-version/)

## Technologies Used

- HTML5 - Semantic markup and structure with data-i18n attributes
- CSS3 - Modern styling with gradients, animations, and responsive design
- Vanilla JavaScript - DOM manipulation, business logic, and internationalization
- SweetAlert2 - Beautiful modal dialogs and notifications
- JSON - Translation files for internationalization
- localStorage - Language preference persistence

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for SweetAlert2 CDN

## Usage

1. Open the application in your web browser
2. **Language Selector** (top right corner):
   - Select "Español" or "English" from the dropdown menu
   - The interface will automatically change to the selected language
   - The preference is automatically saved for future visits
3. Specific Experience Table:
   - Add work periods with start and end dates
   - The calculator automatically computes duration for each entry
   - View total specific experience at the top
4. General Experience Table:
   - Automatically synchronized with specific experience
   - Add additional general experience periods
   - View combined total experience
5. Smart Features:
   - "Clear Fields" button appears only when data exists
   - Confirmation dialogs for destructive actions
   - Responsive design adapts to screen size

## Project Structure

```
professional-experience-calculator/
│
├── index.html                    # Main application file
│   ├── Language Selector        # Language switcher (ES/EN)
│   ├── Header Section           # Logo and title
│   ├── Experience Tables        # Dual table system
│   ├── Footer                   # Author credits
│   └── Scripts                  # JavaScript functionality
│
├── assets/
│   ├── css/
│   │   └── styles.css           # Application styles
│   ├── js/
│   │   └── script.js            # Application logic with i18n
│   └── img/
│       ├── logo.png             # Company logo
│       └── logo.ico             # Favicon
│
├── lang/
│   ├── es.json                  # Spanish translations
│   └── en.json                  # English translations
│
└── README.md                    # Project documentation
```

## Color Scheme

The application uses a professional corporate color palette:
- Primary Gradient: `#20c5bf` → `#7543e9`
- Accent Color: `#20c5bf` (Teal)
- Secondary Color: `#7543e9` (Purple)
- Background: `#f5f5f5` (Light Gray)
- Text: `#1f2937` (Dark Gray)

## Responsive Breakpoints

- Desktop: > 768px
- Tablet: 768px - 480px
- Mobile: < 480px

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](https://github.com/DiegoFalconLeon/ProExperienceCalculator-html-version?tab=GPL-3.0-1-ov-file) file for details.

## Author

Diego Falcón León
- LinkedIn: [diego-falcon-leon](https://www.linkedin.com/in/diego-falcon-leon/)
- Contact: +5198489210

## Acknowledgments

- SweetAlert2 for beautiful modal dialogs
- Google Fonts for typography inspiration
- The open-source community for inspiration

##

Made with ❤️ by Diego Falcón León

Calculate your professional experience with precision and style!</content>
