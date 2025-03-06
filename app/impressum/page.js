const Impressum = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="modern-card max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">Impressum</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-medium mb-2">Angaben gemäß § 5 TMG</h2>
              <div className="space-y-1 text-slate-600 dark:text-slate-400">
                <p>Luke Friedrichs</p>
                <p>Leibnizstraße 2</p>
                <p>48565 Steinfurt</p>
                <p>Deutschland</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-2">Kontaktaufnahme</h2>
              <div className="space-y-1 text-slate-600 dark:text-slate-400">
                <p>E-Mail: lukefriedrichs@gmail.com</p>
                <p>Telefon: +4915736763420</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <div className="space-y-1 text-slate-600 dark:text-slate-400">
                <p>Luke Friedrichs</p>
                <p>Leibnizstraße 2</p>
                <p>48565 Steinfurt</p>
                <p>Deutschland</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-2">Haftungsausschluss für Berechnungen</h2>
              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <p>Die auf dieser Website zur Verfügung gestellten Berechnungen und Analysen dienen ausschließlich zu Informationszwecken. Trotz sorgfältiger Programmierung und regelmäßiger Kontrolle übernehmen wir keine Haftung für die Richtigkeit, Vollständigkeit und Aktualität der durchgeführten Berechnungen.</p>
                <p>Die Nutzung des Berechnungstools erfolgt auf eigene Verantwortung. Für Entscheidungen, die auf Basis der Berechnungsergebnisse getroffen werden, kann keine Haftung übernommen werden. Wir empfehlen, alle Ergebnisse durch Fachexperten überprüfen zu lassen.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-2">Haftung für Inhalte</h2>
              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
                <p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-2">Urheberrecht</h2>
              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Impressum;
