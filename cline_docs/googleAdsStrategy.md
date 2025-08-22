# Google Ads Campaign Strategy for Curl Feather Inc

## Campaign Focus: Drywall Repair Services

### Target Location
- Primary: Belgrade, MT
- Radius: 15-20 miles
- Location bid adjustments: +15% for Belgrade proper

### Keywords Strategy

#### High-Priority Keywords
```
[drywall repair belgrade]
[drywall repair near me]
[drywall patch service]
[drywall hole repair]
[water damage drywall repair]
"drywall repair service"
"emergency drywall repair"
"drywall contractor belgrade"
```

#### Negative Keywords
```
-new construction
-commercial
-wholesale
-diy
-how to
-tutorial
-youtube
```

### Ad Copy Templates

1. Headline Options:
```
Expert Drywall Repair Belgrade MT
Same Day Drywall Repair Service
Professional Patch & Repair
Local Drywall Repair Experts
Emergency Drywall Fixes
```

2. Description Lines:
```
✓ Free Quotes ✓ Fast Response ✓ Expert Repairs
Professional Drywall Repairs in Belgrade. Call Now!
Holes, Cracks & Water Damage. Free Estimates.
Local Experts with 5-Star Service. Call (406) 600-7903
```

3. Call-to-Action:
```
Call Now for Free Quote
Book Your Repair Today
Get Expert Help Now
```

### Campaign Structure

1. Search Campaign: "Belgrade Drywall Repair"
   - Ad Group 1: General Repair
   - Ad Group 2: Emergency Service
   - Ad Group 3: Water Damage
   - Ad Group 4: Patch & Small Repairs

2. Display Campaign: "Local Awareness"
   - Targeting local news sites
   - Home improvement related content
   - Remarketing to website visitors

### Budget Allocation
- Initial Daily Budget: $50-75
- Focus on peak hours: 7am-7pm
- Higher bids during business hours

### Conversion Tracking Setup

1. Phone Call Tracking
```javascript
// Add to landing page header once Google Ads is verified
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-CONVERSION_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-CONVERSION_ID');
</script>
```

2. Call Conversion Event
```javascript
// Add to phone click handler
gtag('event', 'conversion', {
  'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
  'event_category': 'Call',
  'event_label': 'Repair Services Page'
});
```

### Landing Page URL Structure
```
https://curlfeather.com/repairs?source=google&campaign=repair&medium=cpc
```

### Bid Strategy
- Start with Manual CPC
- Target CPA once we have enough conversion data
- Initial max CPC: $3-5

### Quality Score Optimization
1. Landing Page Relevance
   - Dedicated repair services page
   - Clear call-to-action
   - Mobile optimized
   - Fast loading time

2. Ad Relevance
   - Keywords in headlines
   - Location specific
   - Clear value proposition

3. Expected CTR
   - Strong call-to-action
   - Competitive differentiators
   - Social proof elements

### Monitoring & Optimization Schedule

Week 1-2:
- Daily bid adjustments
- Search term analysis
- Ad copy testing
- Conversion tracking verification

Week 3-4:
- Geographic performance review
- Device bid adjustments
- Ad schedule optimization
- Quality score improvements

### Success Metrics
1. Primary KPIs
   - Phone call conversions
   - Cost per lead
   - Conversion rate
   - Click-through rate

2. Secondary Metrics
   - Quality score
   - Average position
   - Impression share
   - Average CPC

### Next Steps
1. [ ] Wait for Google Ads account verification (3-5 days)
2. [ ] Add conversion tracking code
3. [ ] Set up campaign structure
4. [ ] Launch initial test campaign
5. [ ] Monitor and optimize performance

### Notes
- Focus on mobile-first approach
- Emphasize quick response times
- Highlight professional service
- Target seasonal downtimes
- Monitor competitor activity
