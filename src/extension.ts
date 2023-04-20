import * as vscode from 'vscode'

type Node = {
  id: string
  name: string
}

export interface Data {
  message: Node[]
}

export const activate = async (context: vscode.ExtensionContext) => {
	console.log('CodeGraphy - JS Plugin activated!')

	const data: Data = await vscode.commands.executeCommand('codegraphy.getData')
	if (data) {
		const result = {
			nodes: data.message,
			connections: [{ from: data.message[0].id, to: data.message[1].id }],
		}
		await vscode.commands.executeCommand('codegraphy.printData', result)
	}
}
