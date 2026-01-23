
import { SupportRegion, RegionalSupportResources } from '@/types';

export const supportResourcesData: Record<SupportRegion, RegionalSupportResources> = {
  'United States': {
    region: 'United States',
    message: 'We noticed your message may indicate you\'re going through a difficult time. Please know that support is available 24/7, and reaching out is a sign of strength.',
    resources: [
      {
        name: '988 Suicide & Crisis Lifeline',
        description: '24/7 free and confidential support',
        phone: '988',
        website: 'https://988lifeline.org',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Crisis Text Line',
        description: 'Text support available 24/7',
        sms: '741741',
        type: 'crisis',
        icon: 'message',
      },
      {
        name: 'Emergency Services',
        description: 'If you\'re in immediate danger',
        phone: '911',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'SAMHSA National Helpline',
        description: '1-800-662-4357 • Treatment referral and information',
        url: 'https://www.samhsa.gov/find-help/national-helpline',
      },
      {
        title: 'NAMI HelpLine',
        description: '1-800-950-6264 • Mental health support and resources',
        url: 'https://www.nami.org/help',
      },
      {
        title: 'Veterans Crisis Line',
        description: '1-800-273-8255 (Press 1) • Support for veterans',
        url: 'https://www.veteranscrisisline.net',
      },
    ],
  },
  'United Kingdom': {
    region: 'United Kingdom',
    message: 'We noticed your message may indicate you\'re going through a difficult time. Please know that support is available 24/7, and reaching out is a sign of strength.',
    resources: [
      {
        name: 'Samaritans',
        description: '24/7 free and confidential support',
        phone: '116123',
        website: 'https://www.samaritans.org',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Shout Crisis Text Line',
        description: 'Text support available 24/7',
        sms: '85258',
        type: 'crisis',
        icon: 'message',
      },
      {
        name: 'Emergency Services',
        description: 'If you\'re in immediate danger',
        phone: '999',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Mind',
        description: '0300 123 3393 • Mental health support and information',
        url: 'https://www.mind.org.uk',
      },
      {
        title: 'NHS Mental Health Services',
        description: '111 • NHS urgent mental health helpline',
        url: 'https://www.nhs.uk/mental-health',
      },
      {
        title: 'Papyrus HOPELINEUK',
        description: '0800 068 4141 • Support for young people',
        url: 'https://www.papyrus-uk.org',
      },
    ],
  },
  'Canada': {
    region: 'Canada',
    message: 'We noticed your message may indicate you\'re going through a difficult time. Please know that support is available 24/7, and reaching out is a sign of strength.',
    resources: [
      {
        name: 'Talk Suicide Canada',
        description: '24/7 free and confidential support',
        phone: '1-833-456-4566',
        website: 'https://talksuicide.ca',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Crisis Text Line',
        description: 'Text support available 24/7',
        sms: '686868',
        type: 'crisis',
        icon: 'message',
      },
      {
        name: 'Emergency Services',
        description: 'If you\'re in immediate danger',
        phone: '911',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Kids Help Phone',
        description: '1-800-668-6868 • Support for young people',
        url: 'https://kidshelpphone.ca',
      },
      {
        title: 'Wellness Together Canada',
        description: 'Free mental health and substance use support',
        url: 'https://www.wellnesstogether.ca',
      },
      {
        title: 'Canadian Mental Health Association',
        description: 'Mental health resources and support',
        url: 'https://cmha.ca',
      },
    ],
  },
  'Australia': {
    region: 'Australia',
    message: 'We noticed your message may indicate you\'re going through a difficult time. Please know that support is available 24/7, and reaching out is a sign of strength.',
    resources: [
      {
        name: 'Lifeline',
        description: '24/7 free and confidential support',
        phone: '13 11 14',
        website: 'https://www.lifeline.org.au',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Lifeline Text',
        description: 'Text support available 24/7',
        sms: '0477 13 11 14',
        type: 'crisis',
        icon: 'message',
      },
      {
        name: 'Emergency Services',
        description: 'If you\'re in immediate danger',
        phone: '000',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Beyond Blue',
        description: '1300 22 4636 • Mental health support',
        url: 'https://www.beyondblue.org.au',
      },
      {
        title: 'Kids Helpline',
        description: '1800 55 1800 • Support for young people',
        url: 'https://kidshelpline.com.au',
      },
      {
        title: 'MensLine Australia',
        description: '1300 78 99 78 • Support for men',
        url: 'https://mensline.org.au',
      },
    ],
  },
  'New Zealand': {
    region: 'New Zealand',
    message: 'We noticed your message may indicate you\'re going through a difficult time. Please know that support is available 24/7, and reaching out is a sign of strength.',
    resources: [
      {
        name: '1737 Need to Talk?',
        description: '24/7 free and confidential support',
        phone: '1737',
        website: 'https://1737.org.nz',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: '1737 Text Support',
        description: 'Text support available 24/7',
        sms: '1737',
        type: 'crisis',
        icon: 'message',
      },
      {
        name: 'Emergency Services',
        description: 'If you\'re in immediate danger',
        phone: '111',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Lifeline Aotearoa',
        description: '0800 543 354 • 24/7 support',
        url: 'https://www.lifeline.org.nz',
      },
      {
        title: 'Youthline',
        description: '0800 376 633 • Support for young people',
        url: 'https://www.youthline.co.nz',
      },
      {
        title: 'Depression Helpline',
        description: '0800 111 757 • Mental health support',
        url: 'https://depression.org.nz',
      },
    ],
  },
  'Ireland': {
    region: 'Ireland',
    message: 'We noticed your message may indicate you\'re going through a difficult time. Please know that support is available 24/7, and reaching out is a sign of strength.',
    resources: [
      {
        name: 'Samaritans',
        description: '24/7 free and confidential support',
        phone: '116123',
        website: 'https://www.samaritans.org',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: '50808 Text Support',
        description: 'Text support available 24/7',
        sms: '50808',
        type: 'crisis',
        icon: 'message',
      },
      {
        name: 'Emergency Services',
        description: 'If you\'re in immediate danger',
        phone: '999',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Pieta House',
        description: '1800 247 247 • Suicide and self-harm support',
        url: 'https://www.pieta.ie',
      },
      {
        title: 'Aware',
        description: '1800 80 48 48 • Depression and anxiety support',
        url: 'https://www.aware.ie',
      },
      {
        title: 'Jigsaw',
        description: 'Mental health support for young people',
        url: 'https://www.jigsaw.ie',
      },
    ],
  },
  'India': {
    region: 'India',
    message: 'We noticed your message may indicate you\'re going through a difficult time. Please know that support is available 24/7, and reaching out is a sign of strength.',
    resources: [
      {
        name: 'AASRA',
        description: '24/7 free and confidential support',
        phone: '91-9820466726',
        website: 'http://www.aasra.info',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Vandrevala Foundation',
        description: '24/7 mental health support',
        phone: '1860-2662-345',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Emergency Services',
        description: 'If you\'re in immediate danger',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'iCall',
        description: '9152987821 • Counseling service',
        url: 'https://icallhelpline.org',
      },
      {
        title: 'Snehi',
        description: '91-22-27546669 • Crisis intervention',
        url: 'http://www.snehiindia.org',
      },
      {
        title: 'The Live Love Laugh Foundation',
        description: 'Mental health resources and support',
        url: 'https://www.thelivelovelaughfoundation.org',
      },
    ],
  },
  'South Africa': {
    region: 'South Africa',
    message: 'We noticed your message may indicate you\'re going through a difficult time. Please know that support is available 24/7, and reaching out is a sign of strength.',
    resources: [
      {
        name: 'SADAG',
        description: '24/7 free and confidential support',
        phone: '0800 567 567',
        website: 'https://www.sadag.org',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Lifeline South Africa',
        description: '24/7 crisis support',
        phone: '0861 322 322',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Emergency Services',
        description: 'If you\'re in immediate danger',
        phone: '10111',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'South African Depression and Anxiety Group',
        description: 'Mental health support and resources',
        url: 'https://www.sadag.org',
      },
      {
        title: 'ChildLine South Africa',
        description: '116 • Support for children and youth',
        url: 'https://www.childlinesa.org.za',
      },
      {
        title: 'The South African Federation for Mental Health',
        description: 'Mental health advocacy and support',
        url: 'https://www.safmh.org',
      },
    ],
  },
  'Germany': {
    region: 'Germany',
    message: 'Wir haben bemerkt, dass Ihre Nachricht darauf hindeuten könnte, dass Sie eine schwierige Zeit durchmachen. Bitte wissen Sie, dass rund um die Uhr Unterstützung verfügbar ist.',
    resources: [
      {
        name: 'Telefonseelsorge',
        description: '24/7 kostenlose und vertrauliche Unterstützung',
        phone: '0800 111 0 111',
        website: 'https://www.telefonseelsorge.de',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Nummer gegen Kummer',
        description: 'Unterstützung für Kinder und Jugendliche',
        phone: '116 111',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Notdienste',
        description: 'Bei unmittelbarer Gefahr',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Deutsche Gesellschaft für Suizidprävention',
        description: 'Informationen und Hilfsangebote',
        url: 'https://www.suizidprophylaxe.de',
      },
      {
        title: 'Freunde fürs Leben',
        description: 'Aufklärung über Suizid und Depression',
        url: 'https://www.frnd.de',
      },
      {
        title: 'Sozialpsychiatrischer Dienst',
        description: 'Lokale psychiatrische Unterstützung',
        url: 'https://www.psychiatrie.de',
      },
    ],
  },
  'France': {
    region: 'France',
    message: 'Nous avons remarqué que votre message pourrait indiquer que vous traversez une période difficile. Sachez qu\'un soutien est disponible 24h/24 et 7j/7.',
    resources: [
      {
        name: 'SOS Amitié',
        description: 'Soutien gratuit et confidentiel 24h/24',
        phone: '09 72 39 40 50',
        website: 'https://www.sos-amitie.com',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: '3114 - Numéro national de prévention du suicide',
        description: 'Ligne de prévention du suicide 24h/24',
        phone: '3114',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Services d\'urgence',
        description: 'En cas de danger immédiat',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Fil Santé Jeunes',
        description: '0800 235 236 • Soutien pour les jeunes',
        url: 'https://www.filsantejeunes.com',
      },
      {
        title: 'Psycom',
        description: 'Informations sur la santé mentale',
        url: 'https://www.psycom.org',
      },
      {
        title: 'Union Nationale de Prévention du Suicide',
        description: 'Ressources et soutien',
        url: 'https://www.unps.fr',
      },
    ],
  },
  'Spain': {
    region: 'Spain',
    message: 'Hemos notado que su mensaje puede indicar que está pasando por un momento difícil. Sepa que hay apoyo disponible las 24 horas del día.',
    resources: [
      {
        name: 'Teléfono de la Esperanza',
        description: 'Apoyo gratuito y confidencial 24/7',
        phone: '717 003 717',
        website: 'https://www.telefonodelaesperanza.org',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: '024 - Línea de Atención a la Conducta Suicida',
        description: 'Línea de prevención del suicidio 24/7',
        phone: '024',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Servicios de Emergencia',
        description: 'En caso de peligro inmediato',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'ANAR',
        description: '900 20 20 10 • Apoyo para niños y adolescentes',
        url: 'https://www.anar.org',
      },
      {
        title: 'Confederación Salud Mental España',
        description: 'Recursos de salud mental',
        url: 'https://consaludmental.org',
      },
      {
        title: 'Teléfono contra el Suicidio',
        description: '911 385 385 • Prevención del suicidio',
        url: 'https://www.telefonocontraelsuicidio.org',
      },
    ],
  },
  'Italy': {
    region: 'Italy',
    message: 'Abbiamo notato che il tuo messaggio potrebbe indicare che stai attraversando un momento difficile. Sappi che il supporto è disponibile 24 ore su 24.',
    resources: [
      {
        name: 'Telefono Amico',
        description: 'Supporto gratuito e confidenziale 24/7',
        phone: '02 2327 2327',
        website: 'https://www.telefonoamico.it',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Telefono Azzurro',
        description: 'Supporto per bambini e adolescenti',
        phone: '19696',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Servizi di Emergenza',
        description: 'In caso di pericolo immediato',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Samaritans Onlus',
        description: '800 86 00 22 • Prevenzione del suicidio',
        url: 'https://www.samaritansonlus.org',
      },
      {
        title: 'De Leo Fund',
        description: 'Ricerca e prevenzione del suicidio',
        url: 'https://www.deleofund.org',
      },
      {
        title: 'Progetto Itaca',
        description: 'Supporto per la salute mentale',
        url: 'https://www.progettoitaca.org',
      },
    ],
  },
  'Netherlands': {
    region: 'Netherlands',
    message: 'We hebben gemerkt dat uw bericht kan aangeven dat u een moeilijke tijd doormaakt. Weet dat er 24/7 ondersteuning beschikbaar is.',
    resources: [
      {
        name: '113 Zelfmoordpreventie',
        description: 'Gratis en vertrouwelijke ondersteuning 24/7',
        phone: '0800 0113',
        website: 'https://www.113.nl',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: '113 Chat',
        description: 'Chat ondersteuning beschikbaar',
        website: 'https://www.113.nl/chat',
        type: 'crisis',
        icon: 'message',
      },
      {
        name: 'Nooddiensten',
        description: 'Bij onmiddellijk gevaar',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Kindertelefoon',
        description: '0800 0432 • Ondersteuning voor kinderen',
        url: 'https://www.kindertelefoon.nl',
      },
      {
        title: 'Sensoor',
        description: '0900 0767 • Luisterlijn',
        url: 'https://www.sensoor.nl',
      },
      {
        title: 'Mind Korrelatie',
        description: 'Geestelijke gezondheidszorg informatie',
        url: 'https://www.mindkorrelatie.nl',
      },
    ],
  },
  'Belgium': {
    region: 'Belgium',
    message: 'Nous avons remarqué que votre message pourrait indiquer que vous traversez une période difficile. Sachez qu\'un soutien est disponible 24h/24.',
    resources: [
      {
        name: 'Centre de Prévention du Suicide',
        description: 'Soutien gratuit et confidentiel 24/7',
        phone: '0800 32 123',
        website: 'https://www.preventionsuicide.be',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Tele-Onthaal',
        description: 'Luisterlijn 24/7',
        phone: '106',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Services d\'urgence',
        description: 'En cas de danger immédiat',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Awel',
        description: '102 • Soutien pour les jeunes',
        url: 'https://www.awel.be',
      },
      {
        title: 'Ecoute Violences Conjugales',
        description: '0800 30 030 • Soutien pour la violence domestique',
        url: 'https://www.ecouteviolencesconjugales.be',
      },
      {
        title: 'Similes',
        description: 'Soutien pour les proches de personnes suicidaires',
        url: 'https://www.similes.be',
      },
    ],
  },
  'Switzerland': {
    region: 'Switzerland',
    message: 'Wir haben bemerkt, dass Ihre Nachricht darauf hindeuten könnte, dass Sie eine schwierige Zeit durchmachen. Bitte wissen Sie, dass rund um die Uhr Unterstützung verfügbar ist.',
    resources: [
      {
        name: 'Die Dargebotene Hand',
        description: 'Kostenlose und vertrauliche Unterstützung 24/7',
        phone: '143',
        website: 'https://www.143.ch',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Pro Juventute',
        description: 'Unterstützung für Kinder und Jugendliche',
        phone: '147',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Notdienste',
        description: 'Bei unmittelbarer Gefahr',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Ipsilon',
        description: 'Prävention von Suizid',
        url: 'https://www.ipsilon.ch',
      },
      {
        title: 'Santé Psy Suisse',
        description: 'Informations sur la santé mentale',
        url: 'https://www.santepsy.ch',
      },
      {
        title: 'Elternnotruf',
        description: '0848 35 45 55 • Soutien pour les parents',
        url: 'https://www.elternnotruf.ch',
      },
    ],
  },
  'Austria': {
    region: 'Austria',
    message: 'Wir haben bemerkt, dass Ihre Nachricht darauf hindeuten könnte, dass Sie eine schwierige Zeit durchmachen. Bitte wissen Sie, dass rund um die Uhr Unterstützung verfügbar ist.',
    resources: [
      {
        name: 'Telefonseelsorge',
        description: 'Kostenlose und vertrauliche Unterstützung 24/7',
        phone: '142',
        website: 'https://www.telefonseelsorge.at',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Rat auf Draht',
        description: 'Unterstützung für Kinder und Jugendliche',
        phone: '147',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Notdienste',
        description: 'Bei unmittelbarer Gefahr',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Österreichische Gesellschaft für Suizidprävention',
        description: 'Informationen und Hilfsangebote',
        url: 'https://www.suizidpraevention-austria.at',
      },
      {
        title: 'Psychosozialer Dienst',
        description: 'Lokale psychiatrische Unterstützung',
        url: 'https://www.psd-wien.at',
      },
      {
        title: 'Kriseninterventionszentrum',
        description: '01 406 95 95 • Krisenintervention',
        url: 'https://www.kriseninterventionszentrum.at',
      },
    ],
  },
  'Sweden': {
    region: 'Sweden',
    message: 'Vi har märkt att ditt meddelande kan tyda på att du går igenom en svår tid. Vänligen vet att stöd finns tillgängligt dygnet runt.',
    resources: [
      {
        name: 'Mind Självmordslinjen',
        description: 'Gratis och konfidentiellt stöd 24/7',
        phone: '90101',
        website: 'https://mind.se',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'BRIS',
        description: 'Stöd för barn och unga',
        phone: '116 111',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Nödtjänster',
        description: 'Vid omedelbar fara',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: '1177 Vårdguiden',
        description: '1177 • Sjukvårdsrådgivning',
        url: 'https://www.1177.se',
      },
      {
        title: 'Jourhavande Medmänniska',
        description: '08-702 16 80 • Stödlinje',
        url: 'https://www.jourhavande-medmanniska.com',
      },
      {
        title: 'Suicide Zero',
        description: 'Suicidprevention och stöd',
        url: 'https://www.suicidezero.se',
      },
    ],
  },
  'Norway': {
    region: 'Norway',
    message: 'Vi har lagt merke til at meldingen din kan tyde på at du går gjennom en vanskelig tid. Vær oppmerksom på at støtte er tilgjengelig døgnet rundt.',
    resources: [
      {
        name: 'Mental Helse',
        description: 'Gratis og konfidensiell støtte 24/7',
        phone: '116 123',
        website: 'https://www.mentalhelse.no',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Kirkens SOS',
        description: 'Støttelinje 24/7',
        phone: '22 40 00 40',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Nødtjenester',
        description: 'Ved umiddelbar fare',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Alarmtelefonen for barn og unge',
        description: '116 111 • Støtte for barn og unge',
        url: 'https://www.alarmtelefonen.no',
      },
      {
        title: 'Helsedirektoratet',
        description: 'Informasjon om psykisk helse',
        url: 'https://www.helsenorge.no',
      },
      {
        title: 'Voksne for Barn',
        description: '116 111 • Støtte for voksne som er bekymret for barn',
        url: 'https://www.vfb.no',
      },
    ],
  },
  'Denmark': {
    region: 'Denmark',
    message: 'Vi har bemærket, at din besked kan indikere, at du går igennem en svær tid. Vær opmærksom på, at støtte er tilgængelig døgnet rundt.',
    resources: [
      {
        name: 'Livslinien',
        description: 'Gratis og fortrolig støtte 24/7',
        phone: '70 201 201',
        website: 'https://www.livslinien.dk',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'BørneTelefonen',
        description: 'Støtte til børn og unge',
        phone: '116 111',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Nødtjenester',
        description: 'Ved umiddelbar fare',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Psykiatrifonden',
        description: 'Information om mental sundhed',
        url: 'https://www.psykiatrifonden.dk',
      },
      {
        title: 'Headspace',
        description: 'Støtte til unge mellem 12-25 år',
        url: 'https://headspace.dk',
      },
      {
        title: 'Sind',
        description: 'Støtte til mennesker med psykisk sygdom',
        url: 'https://www.sind.dk',
      },
    ],
  },
  'Finland': {
    region: 'Finland',
    message: 'Olemme huomanneet, että viestisi saattaa viitata siihen, että käyt läpi vaikeaa aikaa. Tiedä, että tukea on saatavilla ympäri vuorokauden.',
    resources: [
      {
        name: 'Suomen Mielenterveysseura',
        description: 'Ilmainen ja luottamuksellinen tuki 24/7',
        phone: '09 2525 0111',
        website: 'https://www.mieli.fi',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Kriisipuhelin',
        description: 'Kriisituki 24/7',
        phone: '09 2525 0111',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Hätänumerot',
        description: 'Välittömässä vaarassa',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Mannerheimin Lastensuojeluliitto',
        description: '116 111 • Tuki lapsille ja nuorille',
        url: 'https://www.mll.fi',
      },
      {
        title: 'Sekasin-chat',
        description: 'Chat-tuki nuorille',
        url: 'https://sekasin247.fi',
      },
      {
        title: 'Terveyskylä',
        description: 'Mielenterveyden tietoa ja tukea',
        url: 'https://www.terveyskyla.fi',
      },
    ],
  },
  'Poland': {
    region: 'Poland',
    message: 'Zauważyliśmy, że Twoja wiadomość może wskazywać, że przechodzisz trudny okres. Wiedz, że wsparcie jest dostępne przez całą dobę.',
    resources: [
      {
        name: 'Telefon Zaufania dla Dzieci i Młodzieży',
        description: 'Bezpłatne i poufne wsparcie 24/7',
        phone: '116 111',
        website: 'https://www.116111.pl',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Telefon Zaufania',
        description: 'Wsparcie kryzysowe 24/7',
        phone: '116 123',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Służby ratunkowe',
        description: 'W przypadku bezpośredniego zagrożenia',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Centrum Wsparcia dla Osób w Kryzysie Psychicznym',
        description: 'Wsparcie w kryzysie psychicznym',
        url: 'https://www.centrumwsparcia.pl',
      },
      {
        title: 'Fundacja Itaka',
        description: 'Wsparcie dla rodzin',
        url: 'https://www.itaka.org.pl',
      },
      {
        title: 'Niebieska Linia',
        description: '800 12 00 02 • Wsparcie w przemocy domowej',
        url: 'https://www.niebieskalinia.pl',
      },
    ],
  },
  'Japan': {
    region: 'Japan',
    message: 'あなたのメッセージが困難な時期を示している可能性があることに気づきました。24時間365日サポートが利用可能であることをご承知おきください。',
    resources: [
      {
        name: 'よりそいホットライン',
        description: '24時間無料相談',
        phone: '0120-279-338',
        website: 'https://www.since2011.net/yorisoi',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'いのちの電話',
        description: '24時間相談窓口',
        phone: '0570-783-556',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: '緊急サービス',
        description: '緊急時',
        phone: '110',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'こころの健康相談統一ダイヤル',
        description: '0570-064-556 • メンタルヘルスサポート',
        url: 'https://www.mhlw.go.jp',
      },
      {
        title: 'チャイルドライン',
        description: '0120-99-7777 • 子どもと若者のサポート',
        url: 'https://childline.or.jp',
      },
      {
        title: '自殺予防総合対策センター',
        description: '自殺予防情報とサポート',
        url: 'https://jssc.ncnp.go.jp',
      },
    ],
  },
  'South Korea': {
    region: 'South Korea',
    message: '귀하의 메시지가 어려운 시기를 겪고 있음을 나타낼 수 있음을 알게 되었습니다. 24시간 지원이 가능하다는 것을 알아주시기 바랍니다.',
    resources: [
      {
        name: '생명의 전화',
        description: '24시간 무료 상담',
        phone: '1588-9191',
        website: 'https://www.lifeline.or.kr',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: '자살예방 상담전화',
        description: '24시간 위기 상담',
        phone: '1393',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: '응급 서비스',
        description: '긴급 상황 시',
        phone: '112',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: '한국생명의전화',
        description: '정신건강 지원',
        url: 'https://www.lifeline.or.kr',
      },
      {
        title: '청소년 전화 1388',
        description: '1388 • 청소년 지원',
        url: 'https://www.cyber1388.kr',
      },
      {
        title: '한국자살예방협회',
        description: '자살 예방 정보 및 지원',
        url: 'https://www.suicideprevention.or.kr',
      },
    ],
  },
  'Singapore': {
    region: 'Singapore',
    message: 'We noticed your message may indicate you\'re going through a difficult time. Please know that support is available 24/7, and reaching out is a sign of strength.',
    resources: [
      {
        name: 'Samaritans of Singapore',
        description: '24/7 free and confidential support',
        phone: '1767',
        website: 'https://www.sos.org.sg',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Institute of Mental Health',
        description: '24/7 mental health helpline',
        phone: '6389 2222',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Emergency Services',
        description: 'If you\'re in immediate danger',
        phone: '999',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Silver Ribbon Singapore',
        description: '6385 3714 • Mental health support',
        url: 'https://www.silverribbonsingapore.com',
      },
      {
        title: 'Tinkle Friend',
        description: '1800 2744 788 • Support for children',
        url: 'https://www.tinklefriend.sg',
      },
      {
        title: 'CARE Singapore',
        description: '6978 2728 • Counseling and support',
        url: 'https://www.care-singapore.org',
      },
    ],
  },
  'Hong Kong': {
    region: 'Hong Kong',
    message: 'We noticed your message may indicate you\'re going through a difficult time. Please know that support is available 24/7, and reaching out is a sign of strength.',
    resources: [
      {
        name: 'The Samaritans Hong Kong',
        description: '24/7 free and confidential support',
        phone: '2896 0000',
        website: 'https://www.samaritans.org.hk',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Suicide Prevention Services',
        description: '24/7 crisis support',
        phone: '2382 0000',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Emergency Services',
        description: 'If you\'re in immediate danger',
        phone: '999',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Caritas Family Crisis Support Centre',
        description: '18288 • Family crisis support',
        url: 'https://family.caritas.org.hk',
      },
      {
        title: 'Tung Wah Group of Hospitals',
        description: '18281 • Emotional support hotline',
        url: 'https://www.tungwah.org.hk',
      },
      {
        title: 'Mind HK',
        description: 'Mental health resources and support',
        url: 'https://www.mind.org.hk',
      },
    ],
  },
  'Brazil': {
    region: 'Brazil',
    message: 'Notamos que sua mensagem pode indicar que você está passando por um momento difícil. Saiba que o apoio está disponível 24 horas por dia.',
    resources: [
      {
        name: 'CVV - Centro de Valorização da Vida',
        description: 'Apoio gratuito e confidencial 24/7',
        phone: '188',
        website: 'https://www.cvv.org.br',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'CAPS - Centro de Atenção Psicossocial',
        description: 'Atendimento em saúde mental',
        phone: '0800 61 1997',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Serviços de Emergência',
        description: 'Em caso de perigo imediato',
        phone: '192',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Mapa da Saúde Mental',
        description: 'Recursos de saúde mental',
        url: 'https://www.mapasaudemental.com.br',
      },
      {
        title: 'Unicef - Pode Falar',
        description: 'Apoio para crianças e adolescentes',
        url: 'https://www.unicef.org/brazil',
      },
      {
        title: 'ABP - Associação Brasileira de Psiquiatria',
        description: 'Informações sobre saúde mental',
        url: 'https://www.abp.org.br',
      },
    ],
  },
  'Mexico': {
    region: 'Mexico',
    message: 'Hemos notado que su mensaje puede indicar que está pasando por un momento difícil. Sepa que hay apoyo disponible las 24 horas del día.',
    resources: [
      {
        name: 'Línea de la Vida',
        description: 'Apoyo gratuito y confidencial 24/7',
        phone: '800 911 2000',
        website: 'https://www.gob.mx/salud/conadic',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'SAPTEL',
        description: 'Sistema de Apoyo Psicológico por Teléfono',
        phone: '55 5259 8121',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Servicios de Emergencia',
        description: 'En caso de peligro inmediato',
        phone: '911',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Consejo Ciudadano',
        description: '55 5533 5533 • Apoyo psicológico',
        url: 'https://www.consejociudadanomx.org',
      },
      {
        title: 'AMANC',
        description: 'Apoyo a niños con cáncer y sus familias',
        url: 'https://www.amanc.org',
      },
      {
        title: 'Fundación Origen',
        description: 'Prevención del suicidio',
        url: 'https://www.fundacionorigen.org',
      },
    ],
  },
  'Argentina': {
    region: 'Argentina',
    message: 'Hemos notado que su mensaje puede indicar que está pasando por un momento difícil. Sepa que hay apoyo disponible las 24 horas del día.',
    resources: [
      {
        name: 'Centro de Asistencia al Suicida',
        description: 'Apoyo gratuito y confidencial 24/7',
        phone: '135',
        website: 'https://www.casbuenosaires.com.ar',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Línea 102',
        description: 'Atención para niños, niñas y adolescentes',
        phone: '102',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Servicios de Emergencia',
        description: 'En caso de peligro inmediato',
        phone: '911',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Salud Mental Responde',
        description: '0800 333 1665 • Atención en salud mental',
        url: 'https://www.buenosaires.gob.ar/salud',
      },
      {
        title: 'Fundación INECO',
        description: 'Recursos de salud mental',
        url: 'https://www.ineco.org.ar',
      },
      {
        title: 'Teléfono de la Esperanza',
        description: '(011) 4783-8888 • Apoyo emocional',
        url: 'https://www.telefonodelaesperanza.org.ar',
      },
    ],
  },
  'Chile': {
    region: 'Chile',
    message: 'Hemos notado que su mensaje puede indicar que está pasando por un momento difícil. Sepa que hay apoyo disponible las 24 horas del día.',
    resources: [
      {
        name: 'Salud Responde',
        description: 'Apoyo gratuito y confidencial 24/7',
        phone: '600 360 7777',
        website: 'https://www.minsal.cl',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Fono Infancia',
        description: 'Apoyo para niños y adolescentes',
        phone: '800 200 818',
        type: 'crisis',
        icon: 'phone',
      },
      {
        name: 'Servicios de Emergencia',
        description: 'En caso de peligro inmediato',
        phone: '131',
        type: 'emergency',
        icon: 'warning',
      },
    ],
    additionalResources: [
      {
        title: 'Todo Mejora',
        description: 'Apoyo para jóvenes LGBTQ+',
        url: 'https://www.todomejora.org',
      },
      {
        title: 'Fundación José Ignacio',
        description: 'Prevención del suicidio',
        url: 'https://www.fundacionjoseignacio.org',
      },
      {
        title: 'COSAM',
        description: 'Centros de Salud Mental Comunitaria',
        url: 'https://www.minsal.cl',
      },
    ],
  },
};

export function getDefaultRegionFromLocale(locale: string): SupportRegion {
  console.log('Detecting region from locale:', locale);
  
  const localeMap: Record<string, SupportRegion> = {
    'en-US': 'United States',
    'en-GB': 'United Kingdom',
    'en-CA': 'Canada',
    'en-AU': 'Australia',
    'en-NZ': 'New Zealand',
    'en-IE': 'Ireland',
    'en-IN': 'India',
    'en-ZA': 'South Africa',
    'de-DE': 'Germany',
    'de-AT': 'Austria',
    'de-CH': 'Switzerland',
    'fr-FR': 'France',
    'fr-BE': 'Belgium',
    'fr-CH': 'Switzerland',
    'es-ES': 'Spain',
    'es-MX': 'Mexico',
    'es-AR': 'Argentina',
    'es-CL': 'Chile',
    'it-IT': 'Italy',
    'nl-NL': 'Netherlands',
    'nl-BE': 'Belgium',
    'sv-SE': 'Sweden',
    'no-NO': 'Norway',
    'da-DK': 'Denmark',
    'fi-FI': 'Finland',
    'pl-PL': 'Poland',
    'ja-JP': 'Japan',
    'ko-KR': 'South Korea',
    'zh-SG': 'Singapore',
    'zh-HK': 'Hong Kong',
    'pt-BR': 'Brazil',
  };

  const region = localeMap[locale] || 'United States';
  console.log('Mapped to region:', region);
  return region;
}

export const allRegions: SupportRegion[] = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'New Zealand',
  'Ireland',
  'India',
  'South Africa',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Belgium',
  'Switzerland',
  'Austria',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Poland',
  'Japan',
  'South Korea',
  'Singapore',
  'Hong Kong',
  'Brazil',
  'Mexico',
  'Argentina',
  'Chile',
];
