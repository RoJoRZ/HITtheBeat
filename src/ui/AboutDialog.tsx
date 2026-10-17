import { useRef } from 'react';
import { Info } from 'lucide-react';
import { t } from '../../electron/i18n.mjs';

export function AboutDialog({ version }: { version: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button className="info-button" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog"><Info size={18} aria-hidden="true" />{t('Info over HITtheBeat')}</button>
    <dialog ref={dialog} className="tab-dialog about-dialog" aria-labelledby="about-title" onKeyDown={event => event.stopPropagation()}>
      <header className="panel-heading"><div><p className="eyebrow">{t('JOUW MUZIEKMOMENT')}</p><h2 id="about-title">{t('Over HITtheBeat')}</h2></div><button autoFocus className="secondary" onClick={() => dialog.current?.close()}>{t('Sluiten')}</button></header>
      <p className="about-concept">{t('HITtheBeat is jouw persoonlijke oefenmaatje. Maak van losse oefeningen een duidelijk muziekmoment: bouw een oefensessie, speel op jouw tempo en geef lastige passages extra aandacht. Korte evaluaties en zichtbare voortgang helpen je gericht en regelmatig te oefenen.')}</p>
      <h3>{t('Wat kun je ermee?')}</h3>
      <ul className="about-features">
        <li><strong>{t('Je eigen oefeningen.')}</strong> {t('Voeg MP3 of M4A met AAC toe, met een opdracht en eventueel tablatuur of een foto. Normaliseer het afspeelniveau en regel het volume; de originele audiokopie blijft intact.')}</li>
        <li><strong>{t('Oefenen op jouw tempo en toonhoogte.')}</strong> {t('Laat het BPM schatten en corrigeer het zelf. Speel op 25–300% van het originele tempo zonder toonhoogteverandering, of verander de toonhoogte onafhankelijk met maximaal 12 halve tonen omhoog of omlaag.')}</li>
        <li><strong>{t('Je eigen oefensessies.')}</strong> {t('Combineer oefeningen en benoemde fragmenten in een tabel. Kies per stap het aantal herhalingen en BPM, bewaar je opbouw en zie vooraf de totale duur.')}</li>
        <li><strong>{t('Metronoom en aftellen.')}</strong> {t('Maak metronoom-oefeningen met eigen maatsoort en aantal maten. Kies per oefenblok in je sessie een optionele aftelmaat; voorbereiding telt apart van oefentijd.')}</li>
        <li><strong>{t('Focus op een lastige passage.')}</strong> {t('Kies A–B in de waveform, zoom in en speel het fragment als loop. Onderbreek hiervoor je sessie, bewaar het fragment met een naam en ga daarna verder met je sessie.')}</li>
        <li><strong>{t('Kort evalueren, gericht verder.')}</strong> {t('Beoordeel een fragmentserie of oefening met een cijfer van 1–5. Kies herhalen, hetzelfde tempo of een BPM-aanpassing voor de volgende keer.')}</li>
        <li><strong>{t('Zicht op je voortgang.')}</strong> {t('Bekijk gespeelde oefentijd, oefendagen en oefensessies. Vergelijk tempo en beoordelingen in gezamenlijke grafieken en blader door je oefenritme. Een hoger BPM is niet automatisch beter.')}</li>
        <li><strong>{t('Oefeningen delen met erkenning.')}</strong> {t('Exporteer één oefening met audio, tablatuur, opdracht, instellingen en fragmenten. Voeg een makernaam en boodschap toe; importeren maakt een nieuwe oefening zonder bestaande gegevens te overschrijven.')}</li>
        <li><strong>{t('Lokaal, in jouw taal en met toetsen.')}</strong> {t('Oefen volledig offline zonder account. Kies Nederlands of Engels. Gebruik Spatie voor afspelen/pauzeren, 1 voor opnieuw beginnen en cijfers plus Enter bij evaluaties; de muis blijft ook beschikbaar.')}</li>
      </ul>
      <footer className="about-footer"><span>{version ? t('HITtheBeat · v{0}', version) : t('HITtheBeat · Voorvertoning')}</span><button className="primary" onClick={() => dialog.current?.close()}>{t('Terug naar mijn muziekmoment')}</button></footer>
    </dialog>
  </>;
}
