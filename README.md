# MarkOut
**Native support for Markdown in Outlook**

MarkOut is an Outlook add-in designed to make writing emails in Markdown quick and easy.
It supports the full [GitHub Flavoured Markdown][gfm] specification and enables you to customize
the stylesheets used to render your emails.

## Installation
To install this add-in, open your Outlook Add-ins menu, select **My add-ins** and scroll to the **Custom add-ins**
section. **Add a custom add-in from URL** and use `https://markout.sierrasoftworks.com/outlook/manifest.xml` to
get started.

You can also open your Outlook settings and use the **Customize actions** tab to enable the MarkOut
button in your email composition toolbar for easier access.

## Development
If you wish to develop on `markout`, simply run `npm install` followed by `npm run start:web:test`. Add a custom add-in
from a file and select the `manifest.test.xml` file.

[gfm]: https://github.github.com/gfm/