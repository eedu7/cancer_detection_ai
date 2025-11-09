import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface Props {
    text: string;
}

export const MarkdownRenderer = ({ text }: Props) => {
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {text}
        </ReactMarkdown>
    );
};
