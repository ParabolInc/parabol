# Projektplan: Rechnungsexport

Dieses Dokument beschreibt den Zeitplan und die Verantwortlichkeiten für den neuen Rechnungsexport. Kunden sollen alle Rechnungen eines Jahres als PDF-Paket herunterladen können.

## Meilensteine

- Woche 1: Anforderungen mit dem Support abstimmen und die Datenstruktur festlegen
- Woche 2 und 3: Entwicklung des Exportdienstes und Tests mit Beispieldaten
- Woche 4: Beta-Test mit zehn ausgewählten Kunden
- Woche 5: Fehlerbehebung und Veröffentlichung

## Verantwortlichkeiten

Anja Keller leitet das Projekt und führt die wöchentliche Abstimmung durch. Jonas Weber entwickelt den Exportdienst. Lena Schuster kümmert sich um die Dokumentation und die Kommunikation mit den Kunden.

## Risiken

Die größte Gefahr ist die Datenmigration: Ältere Rechnungen haben ein anderes Format und müssen zuerst konvertiert werden. Außerdem kann der Export bei sehr großen Konten lange dauern. Deshalb läuft er im Hintergrund, und die Kunden erhalten eine E-Mail, sobald das Paket bereitliegt.
