// terminal.js
// Terminal web interactif pour portfolio
// Authentique console noir/vert, glassmorphism, effet de frappe, commandes portfolio et système

class WebTerminal {
    constructor() {
        this.overlay = null;
        this.terminal = null;
        this.input = null;
        this.history = [];
        this.historyIndex = 0;
        this.commands = this.getCommands();
        this.cwd = '~';
        this.username = 'visiteur';
        this.hostname = 'portfolio';
        this.isOpen = false;
        this.typingSpeed = 12;
        this.init();
    }

    init() {
        this.createOverlay();
        this.bindToggle();
    }

    createOverlay() {
        // Overlay glassmorphism
        this.overlay = document.createElement('div');
        this.overlay.id = 'web-terminal-overlay';
        this.overlay.innerHTML = `
            <div class="web-terminal-glass">
                <div class="web-terminal-header">
                    <span class="web-terminal-title">Terminal</span>
                    <button class="web-terminal-close">✕</button>
                </div>
                <div class="web-terminal-console" id="web-terminal-console"></div>
                <div class="web-terminal-input-line">
                    <span class="web-terminal-prompt" id="web-terminal-prompt"></span>
                    <input type="text" class="web-terminal-input" id="web-terminal-input" autocomplete="off" spellcheck="false" />
                </div>
            </div>
            <button class="web-terminal-toggle" id="web-terminal-toggle" title="Terminal">⌨️</button>
        `;
        document.body.appendChild(this.overlay);
        this.terminal = this.overlay.querySelector('.web-terminal-glass');
        this.console = this.overlay.querySelector('#web-terminal-console');
        this.input = this.overlay.querySelector('#web-terminal-input');
        this.prompt = this.overlay.querySelector('#web-terminal-prompt');
        this.closeBtn = this.overlay.querySelector('.web-terminal-close');
        this.toggleBtn = this.overlay.querySelector('#web-terminal-toggle');
        this.setPrompt();
        this.hide();
        this.addEvents();
    }

    setPrompt() {
        this.prompt.textContent = `${this.username}@${this.hostname}:${this.cwd}$`;
    }

    addEvents() {
        this.closeBtn.addEventListener('click', () => this.hide());
        this.toggleBtn.addEventListener('click', () => this.toggle());
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '`') {
                e.preventDefault();
                this.toggle();
            }
        });
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        this.overlay.addEventListener('mousedown', (e) => {
            if (e.target === this.overlay) this.hide();
        });
    }

    bindToggle() {
        // Pour intégration future si besoin
    }

    show() {
        this.overlay.style.display = 'flex';
        setTimeout(() => this.terminal.classList.add('visible'), 10);
        this.isOpen = true;
        this.input.focus();
        if (this.console.innerHTML === '') {
            this.showWelcome();
        }
    }
    showWelcome() {
        this.printLine('Bienvenue dans le terminal de Yliès ! 💻', false);
        this.printLine('Tapez "help" pour voir les commandes disponibles.', false);
        this.printLine('---', false);
    }

    hide() {
        this.terminal.classList.remove('visible');
        setTimeout(() => this.overlay.style.display = 'none', 300);
        this.isOpen = false;
    }

    toggle() {
        if (this.isOpen) this.hide();
        else this.show();
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const cmd = this.input.value.trim();
            if (cmd) {
                this.history.push(cmd);
                this.historyIndex = this.history.length;
                this.printLine(`${this.prompt.textContent} ${cmd}`);
                this.input.value = '';
                this.runCommand(cmd);
            }
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex] || '';
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex] || '';
            } else {
                this.input.value = '';
                this.historyIndex = this.history.length;
            }
            e.preventDefault();
        }
    }

    printLine(text, effect = true) {
        const line = document.createElement('div');
        line.className = 'web-terminal-line';
        this.console.appendChild(line);
        if (effect) {
            this.typeEffect(line, text);
        } else {
            line.textContent = text;
        }
        this.console.scrollTop = this.console.scrollHeight;
    }

    typeEffect(el, text, i = 0) {
        if (i < text.length) {
            el.textContent += text[i];
            setTimeout(() => this.typeEffect(el, text, i + 1), this.typingSpeed);
        }
    }

    clear() {
        this.console.innerHTML = '';
    }

    runCommand(cmd) {
        const [command, ...args] = cmd.split(' ');
        if (this.commands[command]) {
            this.commands[command](args);
        } else {
            this.printLine(`Commande inconnue: ${command}`);
        }
    }

    getCommands() {
        return {
            help: (args) => {
                this.printLine('Commandes disponibles :', false);
                this.printLine('help        : Affiche la liste des commandes', false);
                this.printLine('about       : Présentation rapide', false);
                this.printLine('skills      : Affiche mes compétences (--json ou --verbose pour plus)', false);
                this.printLine('projects    : Quelques projets réalisés', false);
                this.printLine('contact     : Mes infos de contact', false);
                this.printLine('cv          : Ouvre mon CV PDF', false);
                this.printLine('ls          : Liste des fichiers fictifs', false);
                this.printLine('pwd         : Affiche le chemin courant', false);
                this.printLine('clear       : Nettoie le terminal', false);
                this.printLine('date        : Affiche la date et l\'heure', false);
                this.printLine('whoami      : Affiche le nom d\'utilisateur', false);
                this.printLine('github      : Lien vers mon GitHub', false);
                this.printLine('linkedin    : Lien vers mon LinkedIn', false);
                this.printLine('discord     : Lien ou pseudo Discord', false);
                this.printLine('email       : Affiche mon email', false);
                this.printLine('random      : Affiche une citation inspirante', false);
                this.printLine('banner      : Affiche une bannière', false);
                this.printLine('echo        : Répète ce que vous tapez', false);
                this.printLine('---', false);
                this.printLine('Des easter eggs sont cachés dans le terminal... sauras-tu les trouver ?', false);
            },
            about: (args) => {
                this.printLine("Je m'appelle Yliès Nejara, développeur web passionné par l'innovation, le design et la tech. Étudiant à CESI, basé à Chalon-sur-Saône.", false);
            },
            skills: (args) => {
                if (args[0] === '--json') {
                    this.printLine(JSON.stringify({
                        frontend: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Vue'],
                        backend: ['Node.js', 'PHP', 'Laravel'],
                        tools: ['Git', 'Figma', 'VSCode'],
                        learning: ['TypeScript', 'Docker']
                    }, null, 2), false);
                } else if (args[0] === '--verbose') {
                    this.printLine('=== COMPÉTENCES DÉTAILLÉES ===', false);
                    this.printLine('Frontend: HTML5, CSS3, JavaScript ES6+', false);
                    this.printLine('- Frameworks: React, Vue.js, Nuxt', false);
                    this.printLine('- Styling: Tailwind, SCSS, CSS Grid/Flexbox', false);
                    this.printLine('Backend: Node.js, PHP, Laravel', false);
                    this.printLine('Outils: Git, Figma, VSCode, Linux', false);
                } else {
                    this.printLine('JavaScript • HTML5 • CSS3 • React • Vue • PHP • Laravel', false);
                    this.printLine('Try: skills --json or skills --verbose', false);
                }
            },
            projects: (args) => {
                this.printLine('Projets :', false);
                this.printLine("- Portfolio (ce site)", false);
                this.printLine("- Snake Game (Konami code caché)", false);
                this.printLine("- Discord Bot, outils JS, et plus sur GitHub", false);
                this.printLine("GitHub : github.com/yliesn", false);
            },
            contact: (args) => {
                this.printLine('Contact :', false);
                this.printLine('Email : yliès.nejara@gmail.com', false);
                this.printLine('LinkedIn : linkedin.com/in/yliès-nejara', false);
                this.printLine('Discord : yliès#1234', false);
            },
            cv: (args) => {
                this.printLine('Téléchargement du CV...', false);
                window.open('cv.pdf', '_blank');
            },
            ls: (args) => {
                this.printLine('index.html  snake.js  terminal.js  style.css  ...', false);
            },
            pwd: (args) => {
                this.printLine('/home/guest/portfolio', false);
            },
            clear: (args) => {
                this.clear();
            },
            date: (args) => {
                this.printLine(new Date().toLocaleString(), false);
            },
            whoami: (args) => {
                this.printLine(this.username, false);
            },
            github: (args) => {
                this.printLine('Accédez à mon GitHub :', false);
                this.printLine('https://github.com/yliesn', false);
                window.open('https://github.com/yliesn', '_blank');
            },
            linkedin: (args) => {
                this.printLine('Accédez à mon LinkedIn :', false);
                this.printLine('https://linkedin.com/in/yliès-nejara', false);
                window.open('https://linkedin.com/in/yliès-nejara', '_blank');
            },
            discord: (args) => {
                this.printLine('Rejoignez mon serveur Discord :', false);
                this.printLine('https://discord.gg/monserveur', false);
                window.open('https://discord.gg/monserveur', '_blank');
            },
            email: (args) => {
                this.printLine('Mon adresse email :', false);
                this.printLine('yliès.nejara@gmail.com', false);
                window.open('mailto:yliès.nejara@gmail.com', '_blank');
            },
            random: (args) => {
                const quotes = [
                    "La vie est un apprentissage constant.",
                    "Soyez le changement que vous voulez voir dans le monde.",
                    "Le succès est la somme de petits efforts répétés jour après jour.",
                    "N'attendez pas. Le temps ne sera jamais juste.",
                    "Faites ce que vous pouvez, avec ce que vous avez, où vous êtes."
                ];
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                this.printLine(randomQuote, false);
            },
            banner: (args) => {
                this.printLine('==============================', false);
                this.printLine('  Bienvenue sur mon terminal   ', false);
                this.printLine('==============================', false);
            },
            echo: (args) => {
                this.printLine(args.join(' '), false);
            },
            // Easter egg snake
            snake: (args) => {
                if (typeof showSnakeGame === 'function') {
                    this.printLine('Lancement du mini-jeu Snake...', false);
                    showSnakeGame();
                } else {
                    this.printLine('Le jeu Snake n\'est pas disponible.', false);
                }
            },
            coffee: () => {
                this.printLine('      (  )   (   )  )', false);
                this.printLine('       ) (   )  (  (', false);
                this.printLine('       ( )  (    ) )', false);
                this.printLine('       _____________', false);
                this.printLine('      <_____________> ___', false);
                this.printLine('      |             |/ _ \\', false);
                this.printLine('      |               | | |', false);
                this.printLine('      |               |_| |', false);
                this.printLine('   ___|             |\\___/', false);
                this.printLine('  /    \\___________/    \\', false);
                this.printLine('  \\_____________________/', false);
                this.printLine('Café généré ! Productivité +50%', false);
            },
            // Easter egg vim
            vim: () => {
                this.printLine('Démarrage de Vim...', false);
                setTimeout(() => {
                    this.printLine('Bienvenue dans Vim ! ESC puis :q pour s\'échapper', false);
                    this.printLine('(Rassurez-vous, ce n\'est pas le vrai Vim 😄)', false);
                    this.printLine('Personne n\'est vraiment bloqué ici ! 🚪', false);
                }, 1000);
            },
            theme: (args) => {
                const themes = ['matrix', 'cyberpunk', 'retro', 'minimal', 'base'];
                if (!args[0]) {
                    this.printLine(`Thèmes disponibles: ${themes.join(', ')}`, false);
                    return;
                }
                if (themes.includes(args[0])) {
                    this.printLine(`Thème changé vers: ${args[0]}`, false);
                    // Changement dynamique des couleurs principales du terminal via CSS variables
                    if (args[0] === 'cyberpunk') {
                        document.documentElement.style.setProperty('--terminal-accent', '#ff00ff');
                        document.documentElement.style.setProperty('--terminal-bg', '#0a0a0f');
                        document.documentElement.style.setProperty('--terminal-text', '#baffc9');
                        document.documentElement.style.setProperty('--terminal-border', '#ff00ff');
                        document.documentElement.style.setProperty('--terminal-shadow', '#ff00ff44');
                    } else if (args[0] === 'matrix') {
                        document.documentElement.style.setProperty('--terminal-accent', '#00ff41');
                        document.documentElement.style.setProperty('--terminal-bg', '#101a10');
                        document.documentElement.style.setProperty('--terminal-text', '#baffc9');
                        document.documentElement.style.setProperty('--terminal-border', '#00ff41');
                        document.documentElement.style.setProperty('--terminal-shadow', '#00ff4144');
                    } else if (args[0] === 'retro') {
                        document.documentElement.style.setProperty('--terminal-accent', '#ffd700');
                        document.documentElement.style.setProperty('--terminal-bg', '#181818');
                        document.documentElement.style.setProperty('--terminal-text', '#fffbe6');
                        document.documentElement.style.setProperty('--terminal-border', '#ffd700');
                        document.documentElement.style.setProperty('--terminal-shadow', '#ffd70044');
                    } else if (args[0] === 'minimal') {
                        document.documentElement.style.setProperty('--terminal-accent', '#888');
                        document.documentElement.style.setProperty('--terminal-bg', '#181c20');
                        document.documentElement.style.setProperty('--terminal-text', '#e0e0e0');
                        document.documentElement.style.setProperty('--terminal-border', '#444a');
                        document.documentElement.style.setProperty('--terminal-shadow', '#222a');
                    } else if (args[0] === 'base') {
                        document.documentElement.style.setProperty('--terminal-accent', '#00ff41');
                        document.documentElement.style.setProperty('--terminal-bg', '#121618eb');
                        document.documentElement.style.setProperty('--terminal-text', '#e0e0e0');
                        document.documentElement.style.setProperty('--terminal-border', '#444a');
                        document.documentElement.style.setProperty('--terminal-shadow', '#222a');
                    }
                } else {
                    this.printLine('Thème non reconnu', false);
                }
            },
        };
    }
}

// Initialisation auto
window.addEventListener('DOMContentLoaded', () => {
    window.webTerminal = new WebTerminal();
});
