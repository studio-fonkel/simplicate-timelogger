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
