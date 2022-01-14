# TODO:
- Stop timer
- Edit timer
- Edit hours
- Timer in het verleden kunnen starten
- Gebruik Date.toTemporalInstant() om ze te converten naar Temporals!
- Probeer zoveel mogelijk Date te vermijden en Temporal te gebruiken
- Dubbelcheck bij alle plekken waar we getCurrentDate/DateTime/Time gebruiken of we niet `today` zouden moeten gebruiken
- Rename `today` naar `now` ofzo.
- Duration van timer meerekenen in aantal uur gewerkt op een dag.

# TODO:
### Bij urenlogjes niet "(x dagen geleden)" weergeven, alleen bij timers en alleen bij starttijden

### Voor genereren van strings "(x dagen geleden)": gebruik de huidige date in plaats van de huidige datetime
Want nu krijg je dit soort situaties:
```
Maandag 27 december 2021

Start-/eindtijd	            Project	          Aantal uren
08:30 (3 dagen geleden)     Verlof            8:00
16:30 (eergisteren)         Standaard dienstverlening (Vakantie verlof)
```

### Starttijden van timers fixen
Als je als starttijd 12:00 kiest wordt deze weergegeven als 11:59, omdat voor het berekenen van de seconds_spent net 0-59 seconden teveel worden meegenomen, omdat de huidige tijd nooit precies 0 seconden bevat (bijv het is nu 14:25:22 en start tijd is 14:00, dan moet seconds_spent berekend worden met 14:25:00)

### Eindtijden van timers fixen
Eindtijd moet vóór een starttijd kunnen zijn

### Weergave van urenlogs die over meerdere dagen spannen fixen
Controleer hoe dat nu wordt weergegeven en fix zo nodig.

### Urenlogs kunnen editen

### Timers kunnen editen

### Projecten/diensten/uursoorten UX
- Nieuw project/dienst/uursoort kunnen toevoegen
- Bestaand project/dienst/uursoort kunnen bewerken
- Laatst gekozen project/dienst/uursoort automatisch selecteren
- Eventueel shortcuts naar veelgekozen combi's, of zelf in te stellen

### Start-/eindtijden UX
- Enter knop indrukken tijdens focus in tijdvelden
- Start timer knop indrukken zonder starttijd moet kunnen, maar start dan op huidige tijd
- Overweeg datepicker + dateindicator hier, zeker voor scenario's als deze handig: starttijd 22:00, eindtijd 01:41

### UX algemeen
- Bij starten timer op andere dag dan vandaag, vraag of deze op timesheet van vandaag gestart moet worden of op die dag
- Starten timer op dag in toekomst verbieden
- Styling mobiel

### Urenoverzicht gaten snel kunnen opvullen
- Geef plusje o.i.d. weer waar een gat zit tussen bepaalde logs, waardoor je snel een log kunt maken die tussen twee andere logs zit

--------------------------

<details>
  <summary><strong>Troep</strong></summary>

internal/timeline/hours?startDate=2021-12-06&endDate=2021-12-19

Request URL: https://demofonkel.simplicate.nl/api/v2/hours/hours?q[start_date][ge]=2021-12-06%2000:00:00&q[start_date][le]=2021-12-12%2023:59:59&q[employee.id]=employee:afa58dd4b2c525fe6d44e34a3f0f8c3d&select=id,start_date,end_date,project.,organization.,person.,projectservice.,type.,hours,note,is_time_defined,is_recurring,recurrence,recurrence.id,recurrence.rrule,locked,corrections,leave_id,leave_status.,absence_id,assignment_id,billable,is_productive
</details>
