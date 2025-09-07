# AI Security Guide

## API Key Security

This application integrates with Google Gemini AI API for test generation features. Follow these security best practices:

### 1. Environment Variables
- **Never commit API keys to version control**
- Store API keys in environment variables only
- Use `.env` file for local development (not committed to git)
- Use secure environment variable management in production

### 2. API Key Setup

#### Local Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Add your API key to `.env`:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

#### Production Deployment
- Set `GEMINI_API_KEY` as an environment variable in your hosting platform
- **Never** hardcode API keys in your application code
- Use secure secret management services (e.g., AWS Secrets Manager, Azure Key Vault)

### 3. Rate Limiting & Monitoring

The application includes built-in rate limiting to prevent API abuse:

- **Daily Limit**: 1,500 requests per day
- **Hourly Limit**: 100 requests per hour  
- **Per-Minute Limit**: 15 requests per minute

#### Usage Monitoring
- Monitor usage through the AI Usage Monitor in the UI
- Check `/api/ai/usage` endpoint for programmatic access
- Usage statistics are stored locally and reset daily

### 4. Data Privacy

#### What Data is Sent to Gemini API
- Test generation prompts (user descriptions)
- Project context (name, description)
- **No sensitive user data or credentials are sent**

#### Data Handling
- All AI requests are logged for monitoring purposes
- No user data is stored by the AI service
- Generated test scripts are stored locally only

### 5. Security Best Practices

#### For Developers
- Regularly rotate API keys
- Monitor usage patterns for anomalies
- Implement proper error handling for API failures
- Use HTTPS for all API communications

#### For Users
- Be mindful of what information you include in test prompts
- Don't include sensitive data in test descriptions
- Monitor your usage to stay within limits

### 6. Error Handling

The application handles various error scenarios:

- **Rate Limit Exceeded**: Returns 429 status with usage information
- **API Key Missing**: Returns 503 status with helpful message
- **Network Errors**: Graceful fallback with user notification
- **Invalid Responses**: Error handling with retry suggestions

### 7. Fallback Behavior

If AI service is unavailable:
- Users can still create tests manually
- All existing functionality remains available
- Clear error messages guide users to manual alternatives

### 8. Compliance

This implementation follows:
- Google AI API Terms of Service
- General data protection best practices
- Secure API key management standards

## Troubleshooting

### Common Issues

1. **"AI service not available"**
   - Check if `GEMINI_API_KEY` is set in environment variables
   - Verify API key is valid and active

2. **"Rate limit exceeded"**
   - Wait for the appropriate time period to reset
   - Check usage monitor for current limits
   - Consider upgrading to paid tier if needed

3. **"Failed to generate test script"**
   - Check internet connection
   - Verify API key permissions
   - Try with a simpler prompt

### Support

For AI-related issues:
1. Check the AI Usage Monitor in the application
2. Review server logs for detailed error messages
3. Verify API key configuration
4. Check Google AI Studio for service status

## Security Checklist

- [ ] API key stored in environment variables only
- [ ] `.env` file added to `.gitignore`
- [ ] Rate limiting implemented and tested
- [ ] Usage monitoring in place
- [ ] Error handling for all failure scenarios
- [ ] HTTPS enabled in production
- [ ] Regular API key rotation scheduled
- [ ] User data privacy maintained
