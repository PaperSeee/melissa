class MelissaChargeReminder {
    constructor() {
        this.streak = parseInt(localStorage.getItem('melissaStreak') || '0');
        this.lastChargeDate = localStorage.getItem('lastChargeDate');
        this.threatLevel = 0;
        this.init();
    }

    init() {
        this.updateStreakDisplay();
        this.bindEvents();
        this.checkDailyReset();
        this.showRandomMessage();
        this.checkThreatLevel();
    }

    bindEvents() {
        document.getElementById('chargedBtn').addEventListener('click', () => this.markAsCharged());
        document.getElementById('forgotBtn').addEventListener('click', () => this.markAsForgotten());
        document.getElementById('reminderBtn').addEventListener('click', () => this.setReminder());
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.lastChargeDate !== today) {
            // Nouveau jour, vérifier si c'était hier
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (this.lastChargeDate !== yesterday.toDateString() && this.lastChargeDate) {
                // Melissa a oublié hier, reset du streak
                this.streak = 0;
                this.updateStreakDisplay();
                localStorage.setItem('melissaStreak', '0');
            }
        }
    }

    checkThreatLevel() {
        if (this.streak === 0) {
            this.threatLevel = 3;
            document.body.classList.add('threat-mode');
            document.querySelector('.container').classList.add('danger-zone');
        } else if (this.streak < 3) {
            this.threatLevel = 2;
        } else {
            this.threatLevel = 0;
            document.body.classList.remove('threat-mode');
            document.querySelector('.container').classList.remove('danger-zone');
        }
    }

    markAsCharged() {
        const today = new Date().toDateString();
        
        if (this.lastChargeDate !== today) {
            this.streak++;
            this.lastChargeDate = today;
            
            localStorage.setItem('melissaStreak', this.streak.toString());
            localStorage.setItem('lastChargeDate', today);
            
            this.updateStreakDisplay();
            this.showSuccessMessage();
            this.addCelebrationEffect();
            this.checkThreatLevel();
        } else {
            this.showNotification("Tu l'as déjà marqué aujourd'hui ! 😊");
        }
    }

    markAsForgotten() {
        this.streak = 0;
        localStorage.setItem('melissaStreak', '0');
        this.updateStreakDisplay();
        this.showThreatMessage();
        this.addExplosionEffect();
        this.checkThreatLevel();
    }

    updateStreakDisplay() {
        const counter = document.getElementById('streakCounter');
        counter.textContent = this.streak;
        
        // Couleur selon le streak
        if (this.streak >= 7) {
            counter.style.color = '#00b894';
        } else if (this.streak >= 3) {
            counter.style.color = '#fdcb6e';
        } else {
            counter.style.color = '#ff7675';
        }
    }

    showRandomMessage() {
        const messages = [
            "Melissa ! Ton PC attend son câlin électrique ! 🤗⚡",
            "N'oublie pas : un PC heureux = une Melissa heureuse ! 😊💻",
            "Pense à ton PC comme à une plante... qui a besoin d'électricité ! 🌱⚡",
            "Ton PC rêve déjà de sa dose d'énergie nocturne ! 😴🔌",
            "Un petit geste ce soir = pas de galère demain ! 💪⚡",
            "Ton PC compte sur toi ! Ne le déçois pas ! 🥺💻"
        ];

        // Messages avec menace selon le threat level
        const threatMessages = [
            "⚠️ ATTENTION MELISSA ! Ton PC ET ta voiture sont en danger ! 🍸💥🚗",
            "🔥 Si tu oublies encore, je sors les cocktails molotov ! 🍸💣",
            "💥 Ta voiture tremble de peur... CHARGE TON PC ! 🚗💨",
            "🍸 J'ai déjà préparé le cocktail... Il manque plus que l'allumette ! 🔥",
            "⚡ Dernier avertissement avant l'apocalypse automobile ! 🚗💥"
        ];
        
        let selectedMessages = this.threatLevel >= 2 ? threatMessages : messages;
        const randomMessage = selectedMessages[Math.floor(Math.random() * selectedMessages.length)];
        document.getElementById('mainMessage').textContent = randomMessage;
    }

    showSuccessMessage() {
        const successMessages = [
            "Bravo Melissa ! Ton PC est aux anges ! 🎉⚡",
            "YES ! Tu es une championne de la charge ! 🏆💻",
            "Parfait ! Ton PC te dit merci ! 😘🔋",
            "Tu assures grave ! Continue comme ça ! 💪✨",
            "WOOHOO ! Streak de " + this.streak + " jours ! 🔥🎊"
        ];
        
        const message = successMessages[Math.floor(Math.random() * successMessages.length)];
        document.getElementById('mainMessage').textContent = message;
        
        this.showNotification("🎉 Bien joué ! Streak: " + this.streak + " jours !");
    }

    showFailureMessage() {
        const failureMessages = [
            "Oh non ! Ton PC pleure... 😭💻",
            "Aïe aïe aïe ! Ton streak est reset ! 😅🔄",
            "Pas grave ! On recommence à zéro ! 💪😊",
            "Ton PC te pardonne... cette fois ! 😏⚡",
            "Allez, c'est reparti pour un nouveau streak ! 🚀✨"
        ];
        
        const message = failureMessages[Math.floor(Math.random() * failureMessages.length)];
        document.getElementById('mainMessage').textContent = message;
        
        this.showNotification("😅 Streak reset ! Allez, on recommence !");
    }

    showThreatMessage() {
        const threatMessages = [
            "💥 BOOOOOM ! Ta voiture vient d'exploser ! 🚗🔥 (Pas vraiment... CETTE FOIS)",
            "🍸💣 Cocktail molotov lancé ! Ta voiture est en feu ! 🔥🚗 (Dans mes rêves)",
            "💥 KABOOM ! J'espère que tu aimes marcher ! 🚶‍♀️💨",
            "🔥 Ta voiture est devenue un barbecue géant ! 🍖🔥 (Virtuellement)",
            "💣 EXPLOSION ! Ta voiture ressemble à un grille-pain ! ⚡🍞"
        ];
        
        const message = threatMessages[Math.floor(Math.random() * threatMessages.length)];
        document.getElementById('mainMessage').textContent = message;
        
        this.showNotification("🍸💥 MENACE EXÉCUTÉE ! (pas vraiment hein) 😈");
    }

    setReminder() {
        if ("Notification" in window) {
            if (Notification.permission === "granted") {
                this.scheduleNotification();
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        this.scheduleNotification();
                    }
                });
            }
        } else {
            // Fallback pour les navigateurs sans support
            setTimeout(() => {
                alert("🔔 MELISSA ! N'oublie pas de charger ton PC ! ⚡💻");
            }, 5000); // Test dans 5 secondes
        }
        
        this.showNotification("Rappel programmé ! 🔔");
    }

    scheduleNotification() {
        // Programmer pour 20h (8 PM)
        const now = new Date();
        const reminder = new Date();
        reminder.setHours(20, 0, 0, 0);
        
        // Si on est déjà passé 20h, programmer pour demain
        if (now > reminder) {
            reminder.setDate(reminder.getDate() + 1);
        }
        
        const timeUntilReminder = reminder.getTime() - now.getTime();
        
        setTimeout(() => {
            new Notification("🍸💥 ALERTE COCKTAIL MOLOTOV ! 💥🍸", {
                body: "Melissa ! Charge ton PC ou ta voiture va avoir des problèmes ! 🔥🚗",
                icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🍸%3C/text%3E%3C/svg%3E",
                tag: "melissa-threat-reminder"
            });
        }, timeUntilReminder);
        
        // Pour le test, aussi programmer dans 10 secondes
        setTimeout(() => {
            new Notification("🔥 TEST MOLOTOV 🔥", {
                body: "Hey Melissa ! C'est un test de menace ! 🍸💥🚗",
                icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E💣%3C/text%3E%3C/svg%3E"
            });
        }, 10000);
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    addCelebrationEffect() {
        const container = document.querySelector('.container');
        container.classList.add('celebration', 'confetti');
        setTimeout(() => {
            container.classList.remove('celebration', 'confetti');
        }, 2000);
    }

    addExplosionEffect() {
        const container = document.querySelector('.container');
        container.classList.add('explosion');
        setTimeout(() => {
            container.classList.remove('explosion');
        }, 1000);
    }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    new MelissaChargeReminder();
});

// Messages d'encouragement selon l'heure avec menaces
function updateTimeBasedMessage() {
    const hour = new Date().getHours();
    const messageBox = document.getElementById('mainMessage');
    
    if (hour >= 18 && hour <= 23) {
        const eveningMessages = [
            "🌙 C'est le moment parfait pour charger ton PC, Melissa ! ⚡",
            "🍸 Il fait nuit... parfait pour les cocktails molotov ! Charge ton PC ! 💥",
            "🔥 Ta voiture dort paisiblement... pour l'instant ! ⚡💻"
        ];
        messageBox.textContent = eveningMessages[Math.floor(Math.random() * eveningMessages.length)];
    } else if (hour >= 6 && hour <= 12) {
        const morningMessages = [
            "☀️ Bonjour Melissa ! As-tu chargé ton PC hier soir ? 🤔",
            "🌅 Ta voiture a survécu à la nuit... as-tu chargé ton PC ? 🚗⚡",
            "☀️ Nouveau jour, nouvelle chance d'éviter l'explosion ! 💥"
        ];
        messageBox.textContent = morningMessages[Math.floor(Math.random() * morningMessages.length)];
    }
}

// Mettre à jour le message selon l'heure toutes les heures
setInterval(updateTimeBasedMessage, 3600000);
updateTimeBasedMessage();
