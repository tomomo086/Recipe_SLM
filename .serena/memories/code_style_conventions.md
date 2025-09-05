# Recipe SLM - Code Style Conventions

## JavaScript Conventions

### Naming Conventions
- **Functions**: camelCase (`sendMessage`, `showStatus`, `addMessage`)
- **Variables**: camelCase (`userInput`, `sendBtn`, `aiMessageDiv`)
- **Constants**: UPPER_CASE (`API_CONFIG`)
- **DOM IDs**: kebab-case (`user-input`, `send-btn`, `message-modal`)
- **CSS Classes**: kebab-case (`message-container`, `detail-btn`, `message-modal`)

### Function Organization
- **Event Handlers**: Descriptive names with action verbs (`sendMessage`, `clearChat`, `hideMessageModal`)
- **Utility Functions**: Clear purpose indication (`addMessage`, `showStatus`, `optimizeForMobile`)
- **Initialization**: Use `DOMContentLoaded` event for setup

### Error Handling Patterns
```javascript
try {
    // Main operation
} catch (error) {
    addMessage('エラー: ' + error.message, false);
    showStatus('送信エラー: ' + error.message, true);
} finally {
    // Always restore UI state
    sendBtn.disabled = false;
    sendBtn.textContent = '送信';
}
```

### DOM Manipulation Patterns
- **Element Creation**: Use `document.createElement()` with proper class assignment
- **Event Listeners**: Use `addEventListener()` with proper event handling
- **Dynamic Content**: Separate content creation from DOM insertion

## CSS Conventions

### Class Naming
- **Component Classes**: Descriptive single words (`message`, `container`, `modal`)
- **Modifier Classes**: Hyphenated descriptors (`message-container`, `detail-btn`, `close-btn`)
- **State Classes**: Clear state indication (`welcome-message`, `error`, `success`)

### Responsive Design Patterns
- **Mobile-first**: Base styles for mobile, media queries for larger screens
- **Flexible Units**: Use `rem`, `em`, `%`, and `vw/vh` for scalability
- **Touch Targets**: Minimum 44px for interactive elements on mobile

### Animation Conventions
```css
/* Consistent timing and easing */
transition: all 0.3s ease;
animation: fadeIn 0.3s ease;

/* Transform-based animations for performance */
transform: scale(1.05);
transform: translateY(-2px);
```

## HTML Structure Conventions

### Semantic Structure
- **Main Container**: `.container` wrapping all content
- **Content Areas**: Semantic sections (`messages`, `input-area`)
- **Interactive Elements**: Proper ARIA labels and accessibility attributes

### Modal Structure Pattern
```html
<div class="modal" style="display: none;">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Title</h3>
            <button class="close-btn">×</button>
        </div>
        <div class="modal-body">
            <!-- Content -->
        </div>
    </div>
</div>
```

## Mobile Optimization Patterns

### Touch Event Handling
```javascript
// Selective touch event prevention
document.addEventListener('touchstart', function(event) {
    // Allow system operations (3+ fingers)
    if (event.touches.length > 2) {
        return; // No preventDefault()
    }
    
    // Prevent specific gestures (2-finger zoom)
    if (event.touches.length === 2) {
        event.preventDefault();
        return;
    }
    
    // Handle single touch normally
}, { passive: false });
```

### Context Menu Management
```javascript
// Selective context menu enabling
document.addEventListener('contextmenu', function(event) {
    // Allow text selection menus
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
        return;
    }
    
    // Allow input field menus
    const target = event.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
    }
    
    // Prevent other context menus
    event.preventDefault();
});
```

## API Integration Patterns

### Streaming Response Handling
```javascript
// Server-Sent Events pattern for real-time updates
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
        if (line.startsWith('data: ')) {
            // Process streaming data
        }
    }
}
```

### Post-Processing Pattern
```javascript
// Two-phase approach: streaming + enhancement
// Phase 1: Real-time streaming display
// Phase 2: Reconstruct with enhanced features
const finalText = aiMessageDiv.textContent;
if (finalText && finalText.trim().length > 0) {
    aiMessageDiv.remove();
    addMessage(finalText, false); // Adds buttons and structure
}
```

## Japanese Text Handling

### Character Encoding
- **Files**: UTF-8 encoding for all source files
- **API**: Proper Japanese text handling in requests/responses
- **Display**: Correct font rendering for Japanese characters

### UI Text Conventions
- **Button Labels**: Japanese text with emoji for visual clarity (`送信`, `クリア`)
- **Status Messages**: Prefixed with icons (`✓ 応答完了`, `エラー:`)
- **Placeholder Text**: Natural Japanese phrasing

## Performance Optimization

### Asset Loading
- **Progressive Enhancement**: Core functionality first, enhancements after
- **Lazy Loading**: Load heavy resources only when needed
- **Caching Strategy**: Leverage browser caching and Service Worker

### Memory Management
- **Event Cleanup**: Remove event listeners when elements are removed
- **Resource Release**: Properly close readers and connections
- **DOM Efficiency**: Minimize DOM manipulation and reflows