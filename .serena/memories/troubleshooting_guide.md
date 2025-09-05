# Recipe SLM - Troubleshooting Guide

## Common Issues and Solutions

### Android-Specific Problems

#### 3-Finger Screenshot Causing App Freeze
**Problem**: App becomes completely unresponsive after taking screenshots with 3-finger gesture
**Root Cause**: `preventDefault()` was blocking all multi-touch system operations
**Solution**: Modified touch event handling to allow 3+ finger system operations
```javascript
// Allow system operations (screenshots, accessibility)
if (event.touches.length > 2) {
    return; // Don't call preventDefault()
}
```

#### Text Selection Context Menu Not Appearing  
**Problem**: Long-press on text doesn't show copy/paste menu
**Root Cause**: `contextmenu` events were completely disabled
**Solution**: Selective context menu enabling based on text selection and input fields
```javascript
// Allow context menus for text selection and input fields
const selection = window.getSelection();
if (selection && selection.toString().length > 0) {
    return; // Allow menu
}
```

### UI Component Issues

#### Detail Buttons Not Appearing
**Problem**: 📖 buttons not showing up on AI messages
**Root Cause**: Streaming responses bypass `addMessage()` function where buttons are added
**Solution**: Two-phase approach - streaming for real-time, then reconstruction with buttons
```javascript
// After streaming completion
const finalText = aiMessageDiv.textContent;
if (finalText && finalText.trim().length > 0) {
    aiMessageDiv.remove();
    addMessage(finalText, false); // Recreate with buttons
}
```

#### Modal Not Opening/Closing
**Problem**: Detail modal doesn't respond to interactions
**Root Cause**: Event listeners not properly attached or z-index issues
**Solution**: Ensure proper event binding and CSS layering
```javascript
// Proper event listener setup
closeBtn.addEventListener('click', hideMessageModal);
modal.addEventListener('click', function(e) {
    if (e.target === modal) hideMessageModal();
});
```

### API Integration Problems

#### Streaming Response Interruption
**Problem**: AI responses get cut off or don't stream properly
**Root Cause**: Network interruption or improper buffer handling
**Solution**: Robust error handling and buffer management
```javascript
try {
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Process with proper error handling
    }
} finally {
    reader.releaseLock(); // Always cleanup
}
```

#### API Connection Failures
**Problem**: Unable to connect to LM Studio local server
**Root Cause**: Server not running or incorrect URL configuration
**Solution**: Check server status and configuration
```javascript
// API_CONFIG validation
const API_CONFIG = {
    url: 'http://192.168.2.107:1234', // Verify server IP
    model: 'local-model' // Verify model name
};
```

### Performance Issues

#### Memory Leaks from Event Listeners
**Problem**: App becomes slow after extended use
**Root Cause**: Event listeners accumulating without cleanup
**Solution**: Proper event listener management
```javascript
// Remove listeners when elements are removed
element.removeEventListener('click', handler);
```

#### Excessive DOM Manipulation
**Problem**: Laggy UI during message updates
**Root Cause**: Frequent DOM updates and reflows
**Solution**: Batch DOM operations and use document fragments
```javascript
// Batch operations
const fragment = document.createDocumentFragment();
// Add multiple elements to fragment
messagesContainer.appendChild(fragment);
```

## Debugging Strategies

### JavaScript Console Debugging
```javascript
// Debug message processing
console.log('addMessage called:', { text: text.substring(0, 50), isUser });

// Debug modal interactions  
console.log('Detail button clicked');
console.log('Button created and added');
```

### Network Request Monitoring
1. Open DevTools Network tab
2. Monitor fetch requests to LM Studio
3. Check response headers and streaming data
4. Verify proper JSON parsing

### Mobile Device Debugging
1. Enable USB Debugging on Android
2. Use Chrome DevTools remote debugging
3. Monitor touch events and gesture conflicts
4. Test with different Android versions

### Touch Event Analysis
```javascript
// Debug touch interactions
document.addEventListener('touchstart', function(e) {
    console.log('Touch count:', e.touches.length);
    console.log('Touch type:', e.touches.length > 2 ? 'System' : 'User');
});
```

## Prevention Best Practices

### Code Review Checklist
- [ ] Event listeners properly removed on cleanup
- [ ] Error handling for all async operations
- [ ] Mobile touch events don't interfere with system operations
- [ ] Proper accessibility attributes on interactive elements
- [ ] Japanese text encoding handled correctly

### Testing Scenarios
1. **Android Gestures**: Test 2-finger zoom, 3-finger screenshots
2. **Text Selection**: Long-press text in various contexts
3. **Modal Interactions**: Open/close via button, background, ESC key
4. **Network Failures**: Test with server offline/slow connections
5. **Memory Usage**: Extended use sessions to check for leaks

### Performance Monitoring
- Monitor memory usage in DevTools
- Check for excessive event listener counts
- Measure DOM manipulation frequency
- Profile network request patterns

## Recovery Procedures

### App Becomes Unresponsive
1. Force refresh the browser/WebView
2. Clear localStorage/sessionStorage if needed
3. Restart the LM Studio server if API calls fail
4. Check browser console for error messages

### Data Loss Prevention
- No persistent data stored locally (by design)
- Conversations are session-only
- Settings reset on app restart (intentional)

### Emergency Fallbacks
- Manual text copying as backup for detail modal
- Direct server URL access if PWA fails
- Browser refresh to restore functionality