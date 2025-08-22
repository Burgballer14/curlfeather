# Codebase Summary

## Project Structure
```
curlfeather/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   │   ├── cf_logo.png    # Company logo
│   │   └── cf_favicon.png # Site favicon
│   └── src/
│       ├── components/    # React components
│       │   ├── layout/    # Layout components
│       │   │   └── Navbar.js  # Main navigation
│       │   └── pages/     # Page components
│       │       ├── Home.js    # Landing page
│       │       ├── Booking.js # Appointment scheduling
│       │       ├── Services.js # Services listing
│       │       └── Contact.js  # Contact information
│       ├── config/       # Configuration files
│       │   └── integrations.js # Integration settings
│       ├── context/      # React contexts
│       │   └── IntegrationContext.js # Integration state management
│       ├── hooks/        # Custom React hooks
│       │   └── useIntegration.js # Integration hook
│       ├── services/     # Service layer
│       │   └── integrationService.js # External service integration
│       ├── utils/        # Utility functions
│       │   └── integrationHelpers.js # Integration helpers
│       ├── test/         # Testing infrastructure
│       │   ├── webhookTest.js    # Webhook testing utilities
│       │   └── runWebhookTest.js # Test runner
│       ├── App.js        # Main application component
│       └── index.css     # Global styles with Tailwind
└── cline_docs/           # Project documentation
```

## Integration Architecture

### Core Components

1. Integration Service (services/integrationService.js)
   - Handles all external API interactions
   - Manages Zapier webhook communications
   - Implements service-specific operations
   - Error handling and response processing

2. Integration Context (context/IntegrationContext.js)
   - Global state management for integration
   - Loading states
   - Error handling
   - Success notifications
   - Reusable UI components

3. Integration Hook (hooks/useIntegration.js)
   - Custom hook for integration operations
   - State management
   - Operation handlers
   - Error handling
   - Loading states

4. Integration Config (config/integrations.js)
   - API endpoints
   - Service configurations
   - Notification templates
   - Error messages
   - Business rules

### Webhook Testing Infrastructure

1. Webhook Test (test/webhookTest.js)
   - Sample data generation
   - Data transformation functions
   - Price calculations
     * Base rate: $1.40/sq ft
     * Texture: $1.05/sq ft
   - Sheet count calculations
     * 4x12 sheets (48 sq ft)
     * Wall/ceiling distribution
   - Address parsing
   - Calendar date handling

2. Test Runner (test/runWebhookTest.js)
   - Webhook endpoint testing
   - Response validation
   - Error handling
   - Console output formatting

### Data Flow
1. User Interaction
   ```
   Component -> useIntegration Hook -> Integration Service -> Zapier Webhooks
   ```

2. External Service Integration
   ```
   Zapier -> FreshBooks/Google Calendar/Asana -> Notification -> User
   ```

### Integration Points

1. Lead Management
   - Form submission handling
   - Data transformation
   - Multi-service integration
   - Notification system

2. FreshBooks Integration
   - Client creation
   - Estimate generation
   - Pricing calculations
   - Sheet count computation

3. Calendar Integration
   - Site inspection scheduling
   - Availability management
   - Client notifications
   - Team coordination

4. Asana Integration
   - Task creation
   - Lead tracking
   - Project management
   - Team collaboration

## State Management

### Integration Context
- Global loading state
- Error handling
- Success notifications
- Operation status

### Integration Hook
- Operation-specific states
- Form handling
- Data validation
- API communication

## Error Handling

1. Client-Side
   - Form validation
   - Data formatting
   - API error handling
   - User feedback

2. Integration Layer
   - Service availability
   - Response validation
   - Error recovery
   - User notification

## Recent Changes
- Implemented webhook testing infrastructure
- Added pricing and sheet count calculations
- Enhanced data transformation for FreshBooks
- Improved error handling and validation
- Added calendar event scheduling
- Implemented Asana task creation

## Next Steps
1. Project Management Workflow
   - Milestone tracking
   - Progress updates
   - Resource scheduling

2. Time Tracking Integration
   - Time entry automation
   - Cost calculations
   - Profitability tracking

## Notes
- All components use TypeScript-style JSDoc comments
- Integration infrastructure fully tested
- Error handling implemented at all levels
- User feedback system in place
- Documentation maintained for all integration points
