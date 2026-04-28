Never cast a type `as any`

## Error Handling

- **Coerce unknown catch values to Error before logging.** In catch blocks, always normalize the caught value to an Error instance using the pattern \`e instanceof Error ? e : new Error('descriptive fallback')\` before passing to Logger or logError. This ensures consistent error objects with stack traces flow through the logging pipeline, even when non-Error values (strings, objects) are thrown.

  **Good:**

  ```typescript
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    Logger.error(`Permission rule threw on ${info.parentType.name}.${info.fieldName}`, error)
  }
  ```

  **Bad:**

  ```typescript
  } catch (err) {
    Logger.error(`Permission rule threw`, err)
  }
  ```
