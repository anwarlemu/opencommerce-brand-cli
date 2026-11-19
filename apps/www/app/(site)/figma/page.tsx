import { Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { Code } from "@www/components/code";
import { Rows } from "@www/components/gallery";
import { BIN } from "@www/lib/registry";

export const metadata = { title: "Figma" };

const cmd = (rest: string) => `npx ${BIN} ${rest}`;

export default function FigmaPage() {
  return (
    <>
      <PageHead eyebrow="Docs" title="Figma" description="The CLI never calls Figma itself. Each action writes files and prints the Figma MCP tool calls to make with them, in order, so any agent with the Figma tools can carry them out." />
      <PageBody>
        <Section title="Tokens as variables" description="The brand tokens become one Figma collection with a Site mode: colors, sizes, radii, type and motion, each scoped and linked to its CSS variable; shadows become effect styles. The script finds or creates the collection, so it is safe to rerun.">
          <Command command={cmd("figma tokens --out figma")} />
          <Code
            title="steps"
            code={`1. create_session { fileKey, description }
2. use_figma { code: <figma/tokens-1.js>, skillNames: "figma-use,figma-generate-library" }
3. get_variable_defs (optional check, then figma check)`}
          />
        </Section>
        <Section title="Push" description="An illustration, image, slide or print file as an SVG cleaned for Figma, with a use_figma script that imports it as layers when it is small enough and an upload_assets step otherwise. A component preview or a page goes as self-contained HTML for html_to_figma.">
          <Command command={cmd("figma push illustration field")} />
          <Command command={cmd("figma push slide deck/slide-01-cover.svg")} />
          <Command command={cmd("figma push component window")} />
        </Section>
        <Section title="Pull and check" description="pull prints the read steps for a frame and where to save each answer. check reads the saved answers and lists every color, font, size, radius and space that is not a brand token, with the nearest one; it exits 1 when there are any.">
          <Command command={cmd('figma pull "https://figma.com/design/<fileKey>/<name>?node-id=1-2"')} wrap />
          <Command command={cmd("figma check figma/variables-1-2.json figma/design-1-2.txt")} wrap />
        </Section>
        <Section title="Actions" description="All four, with what they write.">
          <Rows
            name="figma.json"
            rows={[
              ["figma tokens", "tokens.json and tokens-N.js (use_figma scripts)."],
              ["figma push <kind>", "kind is illustration, asset, slide, component or page. Writes .figma.svg, push-*.js or .html."],
              ["figma pull <url>", "Writes nothing; prints create_session, get_variable_defs and get_design_context with save paths."],
              ["figma check <files>", "Reads saved MCP answers; off-brand values and the nearest token."],
            ]}
          />
        </Section>
      </PageBody>
    </>
  );
}
