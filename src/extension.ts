import * as vscode from 'vscode'

import type { File } from './utils/types'

import { getConnections } from './utils/file/getConnections'

export interface Data {
  message: File[]
}

export const activate = async (context: vscode.ExtensionContext) => {
	console.log('CodeGraphy - JS Plugin activated!')

	const data: Data = await vscode.commands.executeCommand(
		'codegraphy.getSystemFiles',
	)
	if (data) {
		const files = data.message

		const { nodes, edges } = getConnections(files)

		const result = {
			nodes,
			edges,
		}
		await vscode.commands.executeCommand(
			'codegraphy.sendPluginConnections',
			result,
		)
	}
}
