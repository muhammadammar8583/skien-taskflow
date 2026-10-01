export async function POST() {
	return Response.json(
		{ status: 'error', message: 'Password recovery is not implemented.', data: null },
		{ status: 501 },
	)
}
