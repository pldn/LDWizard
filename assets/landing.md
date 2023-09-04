# GeoData Wizard

GeoData Wizard is een programma waarmee tabellen omgezet kunnen worden naar linked data.

<p><a href="/1" style="font-size: 200%; font-weight: bold;">Klik hier</a> om direct met de GeoData Wizard aan de slag te gaan.</p>

## Hoe werkt de GeoData Wizard?

De GeoData Wizard stelt de gebruiker in staat om tabellen om te zetten naar linked data. Dit gebeurt aan de hand van de volgende 3 stappen:

- Stap 1: Upload
- Stap 2: Configure
- Stap 3: Publish

### Stap 1: Upload

GeoData Wizard kan bestanden in het CSV formaat inlezen. CSV staat voor "Comma Separated Values". De meeste spreadsheet programma's (zoals MS Excel) en database programma's (zoals MS Access) hebben een standaard optie om data in dit formaat te exporteren.

Wanneer het CSV bestand vanaf de harde schijf beschikbaar is kan het tijdens de "Upload" stap worden geselecteerd (Figuur 1).

<!-- <figure>
  <img src="step-1.png">
  <figcaption>
    Figuur 1 - De upload stap in de GeoData Wizard.
  </figcaption>
</figure> -->

Wanneer geen eigen tabel voorhanden is kan ook gebruik worden gemaakt van een voorbeeld tabel door op "example CSV file" te klikken.

## Stap 2: Configure

Wanneer de data geüpload is in de GeoData Wizard kunnen we de transformatie gaan configureren. Deze configuratie bestaat uit de volgende stappen (Figuur 2):

1. Stel in welke kolom wordt gebruikt voor identificatie.
2. Stel in wat het type is van de objecten die in de rijen worden beschreven.
3. Stel in welke eigenschap bij welke kolom hoort.
4. Stel in welke verrijking moet worden toegepast op de cellen.

<!-- <figure>
  <img src="step-2.png">
  <figcaption>
    Figuur 2 - De configuratie stap in de GeoData Wizard. Dit is waar de transformatie wordt ingesteld.
  </figcaption>
</figure> -->

## Stap 3: Publish

Wanneer de GeoData Wizard de transformatie heeft uitgevoerd wordt deze in de volgende formaten aangeboden:

- Download het verrijkte CSV bestand
- Download de gegenereerde linked data
- Download het RML script dat kan worden doorontwikkeld

Daarnaast kan de data direct worden geüpload naar de triple store van het Platform Linked Data Nederland (PLDN) of naar het Kadaster (Figuur 3).

<!-- <figure>
  <img src="step-3.png">
  <figcaption>
    Figuur 3 - De publicatie stap in de GeoData Wizard.
  </figcaption>
</figure> -->

## Waarom linked data?

De kracht van linked data is dat datasets via het web aan elkaar kunnen worden gekoppeld. Bovendien worden in linked data standaarden toegepast waardoor de gegevens beter uitwisselbaar zijn. Neem een kijkje op [de website van het Platform Linked Data Nederland](https://www.pldn.nl/wiki/Wat_is_het) voor meer informatie over linked data.
