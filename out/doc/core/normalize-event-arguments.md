## Modules

<dl>
<dt><a href="#module_jstag/core/normalize-event-arguments">jstag/core/normalize-event-arguments</a></dt>
<dd></dd>
<dt><a href="#module_normalizeEventArguments">normalizeEventArguments</a> ⇒ <code>Object</code></dt>
<dd><p>This method takes parameters in any order, and categorizes them based on
    their data type. It exists for backwards compatibility, because the
    parameters were added over time, and so this signature ended up being
    pretty weird. Since we don&#39;t know how it&#39;s being used, and since any
    of the parameters can be omitted, it ended up like this. Going forward,
    it would be good if we could remove this.</p>
</dd>
</dl>

<a name="module_jstag/core/normalize-event-arguments"></a>

## jstag/core/normalize-event-arguments
<a name="module_normalizeEventArguments"></a>

## normalizeEventArguments ⇒ <code>Object</code>
This method takes parameters in any order, and categorizes them based on
    their data type. It exists for backwards compatibility, because the
    parameters were added over time, and so this signature ended up being
    pretty weird. Since we don't know how it's being used, and since any
    of the parameters can be omitted, it ended up like this. Going forward,
    it would be good if we could remove this.

**Returns**: <code>Object</code> - the normalized message hash  

| Param | Type | Description |
| --- | --- | --- |
| [stream] | <code>string</code> | the Lytics stream name |
| [data] | <code>Object</code> | the payload to collect |
| [mock] | <code>boolean</code> | is it a mock send |
| [callback] | <code>function</code> | a callback to call once the message is     processed |

