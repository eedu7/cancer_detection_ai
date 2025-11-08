
interface Props {
    params: Promise<{ reportId: string }>;
}

export default async function Page({ params }: Props) {
    const { reportId } = await params
    return (
        <div>Page: {reportId}</div>
    )
}
