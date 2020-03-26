/**
 * WordPress dependencies
 */
import {
	PostTitle,
	VisualEditorGlobalKeyboardShortcuts,
} from '@wordpress/editor';
import {
	WritingFlow,
	Typewriter,
	ObserveTyping,
	BlockList,
	CopyHandler,
	BlockSelectionClearer,
	MultiSelectScrollIntoView,
	__experimentalBlockSettingsMenuFirstItem,
} from '@wordpress/block-editor';
import { Popover } from '@wordpress/components';
import { useState, useEffect, createPortal } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockInspectorButton from './block-inspector-button';
import { useResizeCanvas } from '../resize-canvas';

export const IFrame = ( { children, head, styles, ...props } ) => {
	const [ contentRef, setContentRef ] = useState();
	const doc = contentRef && contentRef.contentWindow.document;

	useEffect( () => {
		if ( doc ) {
			doc.body.style.margin = '0px';
			doc.head.innerHTML = head;

			styles.forEach( ( { css } ) => {
				const styleEl = doc.createElement( 'style' );
				styleEl.innerHTML = css;
				doc.head.appendChild( styleEl );
			} );

			[ ...document.styleSheets ].reduce( ( acc, styleSheet ) => {
				try {
					const isMatch = [ ...styleSheet.cssRules ].find(
						( { selectorText } ) => {
							return (
								selectorText.indexOf(
									'.editor-styles-wrapper'
								) !== -1
							);
						}
					);

					if ( isMatch ) {
						const node = styleSheet.ownerNode;

						if ( ! doc.getElementById( node.id ) ) {
							doc.head.appendChild( node );
						}
					}
				} catch ( e ) {}

				return acc;
			}, [] );
		}
	}, [ doc ] );

	return (
		// eslint-disable-next-line jsx-a11y/iframe-has-title
		<iframe { ...props } ref={ setContentRef }>
			{ doc && createPortal( children, doc.body ) }
		</iframe>
	);
};

function VisualEditor( { settings } ) {
	const inlineStyles = useResizeCanvas();

	return (
		<>
			<Popover.Slot name="block-toolbar" />
			<IFrame
				className="edit-post-visual-editor"
				style={ inlineStyles }
				head={ settings.editor_style_html }
				styles={ settings.styles }
			>
				<BlockSelectionClearer className="editor-styles-wrapper">
					<VisualEditorGlobalKeyboardShortcuts />
					<MultiSelectScrollIntoView />
					<Typewriter>
						<CopyHandler>
							<WritingFlow>
								<ObserveTyping>
									<CopyHandler>
										<div className="edit-post-visual-editor__post-title-wrapper">
											<PostTitle />
										</div>
										<BlockList />
									</CopyHandler>
								</ObserveTyping>
							</WritingFlow>
						</CopyHandler>
					</Typewriter>
					<__experimentalBlockSettingsMenuFirstItem>
						{ ( { onClose } ) => (
							<BlockInspectorButton onClick={ onClose } />
						) }
					</__experimentalBlockSettingsMenuFirstItem>
				</BlockSelectionClearer>
			</IFrame>
		</>
	);
}

export default VisualEditor;
