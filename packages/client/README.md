# Client

| Concern                | Solution                                                   |
| ---------------------- | ---------------------------------------------------------- |
| Real-time Connectivity | [trebuchet](https://github.com/mattkrick/trebuchet-client) |
| Data Transport         | [GraphQL](https://github.com/graphql/graphql-js)           |
| Client Cache           | [Relay](https://facebook.github.io/relay/)                 |
| UI Framework           | [React](https://facebook.github.io/react/)                 |
| Styling (Legacy)       | [Emotion](https://emotion.sh/)                             |
| Styling                | [TailwindCSS](https://tailwindcss.com)                     |
| UI Primitives          | [RadixUI](https://www.radix-ui.com/)                       |

## UI components

### Migration from Emotion to Tailwind CSS

#### What is Tailwind CSS?

Tailwind CSS is a style-agnostic, build time, utility CSS framework that provides CSS classes like `m-1 p-2 h-12 w-12 flex flex-col items-center justify-center md:flex-row`, that can be used directly in the markup.

#### Why Tailwind CSS?

1. It plays nicely with component frameworks like React.

   There’s no need to name parts of the HTML which doesn’t have a semantic meaning. No more `MeetingCardRoot`, `MeetingCardInnerWrapperRoot`, and stuff like that.

2. No context switch and speed of prototyping

   When working with the UI, going back & forth between CSS files or extracting styled components slows you down and makes it harder to see the big picture. There’s still a separation of concerns, CSS still live in their place, and we just use predefined classes.

3. No runtime overhead

   There’s 0 runtime performance penalty as it’s a build-time framework

4. Responsive design is _very_ easy

   Tailwind CSS breakpoints use `@media (min-width: ...) { ... }`, which makes supporting various screen sizes effortless. The example below shows how easy it is to apply different styles for various breakpoints. Text will be small on the small screen, and it’ll get bigger when reaching the subsequent breakpoints. The same mechanism makes it very easy to support things like [dark mode.](https://tailwindcss.com/docs/dark-mode) too.

   ```jsx
   <div className='md:text-md text-sm text-black dark:text-white lg:text-lg xl:text-xl'>
     I should scale and change color depeding on the theme
   </div>
   ```

5. No predefined styles

   Unlike frameworks like bootstrap and other CSS framework, Tailwind itself doesn’t provide any predefined styles (well, except for the `preflight` - [https://tailwindcss.com/docs/preflight](https://tailwindcss.com/docs/preflight), which is basically a modern equivalent of [CSS normalize](https://necolas.github.io/normalize.css/) and can be disabled). It won’t look old after a while.

---

#### How to’s

1. Add a new utility class, customize the existing one, or change generated colors.

   Tailwind CSS is configured with **`tailwind.config.js`** where everything related to generated classes can be customized and configured. Do it there if you need to add a new color, spacing value, breakpoint, or change any other behavior. See the Parabol’s config here:[https://github.com/ParabolInc/parabol/blob/487be14596c24d6aaee1efe009c764708357342e/packages/client/tailwindTheme.ts](https://github.com/ParabolInc/parabol/blob/487be14596c24d6aaee1efe009c764708357342e/packages/client/tailwindTheme.ts#L4). More info: [https://tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)

2. Using theme values in CSS

   There’s a special `theme` function that can be used to get the value tailwind config

   ```css
   .btn-blue {
     background-color: theme(colors.blue.500);
   }
   ```

   More info: [https://tailwindcss.com/docs/functions-and-directives#theme](https://tailwindcss.com/docs/functions-and-directives#theme)

3. Overriding styles of 3rd party library

   The easiest way is to use `@apply` directive. See the example in Parabol’s repo here: [https://github.com/ParabolInc/parabol/pull/7597/files#diff-10d9decef8eb3746d2eabf83b8f35b380c852e39e0726e7392808ace853d93b2R150](https://github.com/ParabolInc/parabol/pull/7597/files#diff-10d9decef8eb3746d2eabf83b8f35b380c852e39e0726e7392808ace853d93b2R150)

   ```css
   /** Customize draft-js */
     .draft-blockquote {
       @apply my-[8px] mx-0 border-l-[2px] border-slate-500 px-[8px] py-0 italic;
     }

     .draft-codeblock {
       @apply m-0 border-[1px] border-l-[2px] border-slate-500 bg-slate-200 px-0 py-[8px] font-mono font-[13px] leading-normal;
     }
     /* ---------------------------------------------------- */

     /** Customize daypicker styles *
     .rdp {
       @apply m-[8px];
       --rdp-cell-size: 36px;
       --rdp-accent-color: theme(colors.grape.500);
       --rdp-background-color: theme(colors.grape.500 / 30%);
       --rdp-accent-color-dark: theme(colors.grape.500);
       --rdp-background-color-dark: theme(colors.grape.500 / 30%);
     }
   ```

   More info [https://tailwindcss.com/docs/functions-and-directives#apply](https://tailwindcss.com/docs/functions-and-directives#apply)

4. Using one-time arbitrary values

   If you need to use some arbitrary value that isn’t configured and generated by Tailwind, use `[]` notation. For example, to use custom padding, use `p-[20px]` . The same goes for any other utility classes, like margins, dimensions, etc. More info: [https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values)

5. Handling focus and other states - [https://tailwindcss.com/docs/hover-focus-and-other-states](https://tailwindcss.com/docs/hover-focus-and-other-states)

6. Overriding styles of components created using Emotion

   Currently, we increased specificity of Tailwind CSS classes using selector strategy configuration [here](https://github.com/ParabolInc/parabol/blob/a0f3b0999750c7742797456c6035f650efed56c3/tailwind.config.js#L5). This means, we can simply override styles of Emotion component by using `className` property.

   Example

   ```jsx
   const FlatButton =
     styled(BaseButton) <
     FlatButtonProps >
     ((props) => {
       const {palette = 'dark', disabled, waiting} = props
       const visuallyDisabled = disabled || waiting
       return {
         backgroundColor: 'transparent',
         borderRadius: Radius.BUTTON_PILL,
         color: paletteColors[palette],
         outline: 0,
         ':hover,:focus,:active': {
           backgroundColor: !visuallyDisabled ? PALETTE.SLATE_200 : undefined,
           boxShadow: 'none'
         }
       }
     })

   export default FlatButton
   ```

   and then, doing this

   ```
    <FlatButton className="bg-white" />
   ```

   should work just fine.

7. Overriding styles of components styled using Tailwind CSS

   Due to the configuration mentioned in 6., doing this, is a little bit tricky! To increase spcificity of Emotion component, you can do this

   ```jsx
   const StyledCheckbox = styled(Checkbox)({
     '&&': {
       width: 24,
       height: 24,
       marginRight: 8,
       color: PALETTE.SKY_500
     }
   })
   ```

   However, the recommended solution is to migrate Emotion components to Tailwind.

---

#### Common gotchas

1. Handling runtime styles

   Tailwind CSS is a build-time framework meaning, any values _not_ available during the build time, can’t be used. For example

   ```jsx
   // won't work. tailwind does not have any runtime engine
   // and it has no clue what `size` means, so no classes will be generated
   // and no style applied
   <div className={`mt-[${size === 'lg' ? '22px' : '17px'}]`}></div>
   ```

   ```jsx
   // instead, do this
   <div className={size === 'lg' ? 'mt-10' : 'mt-5'}></div>
   ```

   Okay, but what if I need a runtime value in styles, and I can’t pick any predefined classes?

   ```jsx
   const measuredHeight = ref.current.clientHeight

   return <div className={`h-${measuredHeight}`}></div> // won't work
   ```

   Use inline styles

   ```jsx
   const measuredHeight = ref.current.clientHeight

   return <div style={{height: measuredHeight}}></div>
   ```

   Or use CSS variables, ie. set the CSS variable in the runtime, and do the following

   ```jsx
   const setHeight = (height: number) => {
     document.documentElement.style.setProperty('--h-measured', height)
   }
   ```

   ```jsx
   module.exports = {
     theme: {
       extend: {
         height: {
           measured: 'var(--h-measured)'
         }
       }
     }
   }
   ```

   ```jsx
   return <div className='h-measured'></div>
   ```

   Ok, but I need to build a runtime styling engine and allow users to customize everything. What then? Use CSS variables.

   ```jsx
   module.exports = {
     theme: {
       extend: {
         colors: {
           header: 'var(--header)',
           primary: 'var(--primary)',
           secondary: 'var(--secondary)',
           main: 'var(--main)',
           background: 'var(--background)',
           accent: 'var(--accent)',
           footer: 'var(--footer)'
         }
       }
     }
   }
   ```

Anything in the `tailwind.config.js` can be configured to use a CSS variable. Then, set the CSS variable in runtime, and you’re good.

---

#### **Questions & Concerns**

1. At what point do we turn an element into a component vs. just applying a bunch of class names to a div?

   Tailwind take: [https://tailwindcss.com/docs/reusing-styles](https://tailwindcss.com/docs/reusing-styles)

   Knowing when to extract a new React component or a separate function from a block of code is more of an art than a science. However, with Emotion and styled-components, it's common practice to always extract a new component to apply styles - resulting in components with generic names like `CardRoot`, `InnerCardWrapper`, or `HeaderWrapper`. Unfortunately, these names often lack meaning, leaving developers to come up with names when applying styles to a div. Alternatively, we have large components with many divs and long lists of Tailwind CSS classes that can be difficult to read. The ideal approach is somewhere in between. Each React component should have a semantic meaning. If you can think of a piece of HTML as a function of some property or state, then it's likely a good candidate for a separate component. Designing components is a separate topic, there’s a good article in React docs about it [https://beta.reactjs.org/learn/thinking-in-react](https://beta.reactjs.org/learn/thinking-in-react).

2. Isn't it better to create a CSS class like .btn-primary instead of creating a React component?

   While this is not as black and white for a a simple HTML element like button, it's more clear for more complex HTML structures.
   Here are pros and cons of creating React component that renders a <button /> with predefined styles, instead of creating `.btn-primary` CSS class

   Pros:

   - Handling complex logic - it's easier to add more complex logic like loading state, having multiple variants
   - Colocating styles and markup - that's where Tailwind shines the most - you can easily see styling, the html structure in the same place
   - Easier to write <Button variant="primary" /> than <button className="btn-primary" />
   - Easier refactoring - changing prop name will automatically update all usages, while updating the class name will be a manual/semi-manual work
   - Feels more natural - having component framework in place and creating CSS abstractions feels off

   Cons:

   - May be an overkill if you assume button won't change and it'll always render the same thing

3. Do we have to write all new components in it?

   If we’re all onboard to try Tailwind CSS, then yes.

4. Will we mix Emotion and Tailwind CSS in one component or always convert the whole component?

   The preferred way should be to convert the component to use one styling technique. It’s just easier to work with.

5. Will we completely replace Emotion?

   It should be the goal, yes. That said, our code base is pretty big, and it’ll take time to migrate.

6. What do we gain?
   - Speed of development - after a while, prototyping UI with Tailwind is _really_ fast to the extent it’s hard to go back to something else. Supporting different screen sizes, themes, and states like hover, active, etc., become very easy.
   - Performance - Unlike Emotion, Tailwind, as a build-time framework, does not introduce _any_ performance penalty
   - Same styling stack as our marketing site, so it’ll be easier for other folks to contribute.

---

#### Migration guide

1. All the new components are created with Tailwind CSS
2. When working with old components, the preferred way would be to migrate styles to Tailwind CSS. If the component is big enough, it’s ok to fix/change something and leave Emotion in place. Do your best, though ;)
3. Gradually improve our `tailwind.config.js` i.e. if you see a spacing value, color, breakpoint or something we use for styling in many places, configure the value in the config and use it via Tailwind CSS generated classes.
4. When migrating exisiting Emotion components, it might be useful to use Chat GPT with a given prompt: TODO


#### Examples of using Tailwind CSS

1. [shadcn/ui](https://ui.shadcn.com/)
2. [calcom/cal.com: Scheduling infrastructure for absolutely everyone.](https://github.com/calcom/cal.com)
