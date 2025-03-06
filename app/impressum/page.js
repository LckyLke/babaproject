'use client';
import { motion } from 'framer-motion';

const Impressum = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Main Impressum Content */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="modern-card h-full"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.h1 
                className="text-3xl font-bold mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Impressum
              </motion.h1>
              
              <div className="space-y-8">
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">Angaben gemäß § 5 TMG</h2>
                  <div className="space-y-2 text-slate-600 dark:text-slate-400">
                    <p>Luke Friedrichs</p>
                    <p>Leibnizstraße 2</p>
                    <p>48565 Steinfurt</p>
                    <p>Deutschland</p>
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
                  <div className="space-y-2 text-slate-600 dark:text-slate-400">
                    <p>Luke Friedrichs</p>
                    <p>Leibnizstraße 2</p>
                    <p>48565 Steinfurt</p>
                    <p>Deutschland</p>
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">Haftungsausschluss für Berechnungen</h2>
                  <div className="space-y-3 text-slate-600 dark:text-slate-400">
                    <p>Die auf dieser Website zur Verfügung gestellten Berechnungen und Analysen dienen ausschließlich zu Informationszwecken. Trotz sorgfältiger Programmierung und regelmäßiger Kontrolle übernehmen wir keine Haftung für die Richtigkeit, Vollständigkeit und Aktualität der durchgeführten Berechnungen.</p>
                    <p>Die Nutzung des Berechnungstools erfolgt auf eigene Verantwortung. Für Entscheidungen, die auf Basis der Berechnungsergebnisse getroffen werden, kann keine Haftung übernommen werden. Wir empfehlen, alle Ergebnisse durch Fachexperten überprüfen zu lassen.</p>
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">Haftung für Inhalte</h2>
                  <div className="space-y-3 text-slate-600 dark:text-slate-400">
                    <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
                    <p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">Urheberrecht</h2>
                  <div className="space-y-3 text-slate-600 dark:text-slate-400">
                    <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
                  </div>
                </motion.section>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Information Sidebar */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="modern-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.h2 
                className="text-2xl font-bold mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Kontakt
              </motion.h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center space-x-3 text-slate-600 dark:text-slate-400"
                    whileHover={{ scale: 1.05, x: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:lukefriedrichs@gmail.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      lukefriedrichs@gmail.com
                    </a>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center space-x-3 text-slate-600 dark:text-slate-400"
                    whileHover={{ scale: 1.05, x: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href="tel:+4915736763420" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      +49 157 3676 3420
                    </a>
                  </motion.div>

                  <motion.div 
                    className="flex items-center space-x-3 text-slate-600 dark:text-slate-400"
                    whileHover={{ scale: 1.05, x: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" strokeWidth={2} />
                    </svg>
                    <a 
                      href="https://www.linkedin.com/in/luke-friedrichs-b40a391aa/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      LinkedIn Profil
                    </a>
                  </motion.div>
                </div>

                <motion.div 
                  className="pt-6 border-t border-slate-200 dark:border-slate-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Für geschäftliche Anfragen kontaktieren Sie mich bitte bevorzugt per E-Mail oder über LinkedIn.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Impressum;
