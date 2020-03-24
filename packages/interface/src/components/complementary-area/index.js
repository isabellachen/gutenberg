/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Animate, Button, Panel, Slot, Fill } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { withPluginContext } from '@wordpress/plugins';
import { starEmpty, starFilled } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import ComplementaryAreaHeader from '../complementary-area-header';
import PinnedItems from '../pinned-items';

function ComplementaryAreaSlot( { scope, ...props } ) {
	return <Slot name={ `ComplementaryArea/${ scope }` } { ...props } />;
}

function ComplementaryAreaFill( { scope, children, className } ) {
	return (
		<Fill name={ `ComplementaryArea/${ scope }` }>
			<Animate type="slide-in" options={ { origin: 'left' } }>
				{ () => <div className={ className }>{ children }</div> }
			</Animate>
		</Fill>
	);
}

function ComplementaryArea( {
	children,
	className,
	closeLabel = __( 'Close plugin' ),
	complementaryAreaIdentifier,
	header,
	headerClassName,
	icon,
	isPinnable = true,
	panelClassName,
	scope,
	smallScreenTitle,
	title,
	toggleShortcut,
} ) {
	const singleActiveAreaStoreKey = `${ scope }/complementary-area`;
	const pinnedItemsStoreKey = `${ scope }/pinned-items`;
	const { isActive, isPinned } = useSelect(
		( select ) => {
			const { getSingleActiveArea, isMultipleActiveAreaActive } = select(
				'core/interface'
			);
			return {
				isActive:
					getSingleActiveArea( singleActiveAreaStoreKey ) ===
					complementaryAreaIdentifier,
				isPinned: isMultipleActiveAreaActive(
					pinnedItemsStoreKey,
					complementaryAreaIdentifier
				),
			};
		},
		[
			complementaryAreaIdentifier,
			singleActiveAreaStoreKey,
			pinnedItemsStoreKey,
		]
	);
	const { setSingleActiveArea } = useDispatch( 'core/interface' );
	const { setMultipleActiveAreaEnableState } = useDispatch(
		'core/interface'
	);
	return (
		<>
			{ isPinned && (
				<PinnedItems scope={ scope }>
					<Button
						icon={ icon }
						label={ title }
						onClick={ () =>
							isActive
								? setSingleActiveArea(
										singleActiveAreaStoreKey
								  )
								: setSingleActiveArea(
										singleActiveAreaStoreKey,
										complementaryAreaIdentifier
								  )
						}
						isPressed={ isActive }
						aria-expanded={ isActive }
					/>
				</PinnedItems>
			) }
			{ isActive && (
				<ComplementaryAreaFill
					className={ classnames(
						'interface-complementary-area',
						className
					) }
					scope={ scope }
				>
					<ComplementaryAreaHeader
						className={ headerClassName }
						closeLabel={ closeLabel }
						onClose={ () =>
							setSingleActiveArea( singleActiveAreaStoreKey )
						}
						smallScreenTitle={ smallScreenTitle }
						toggleShortcut={ toggleShortcut }
					>
						{ header || (
							<>
								<strong>{ title }</strong>
								{ isPinnable && (
									<Button
										icon={
											isPinned ? starFilled : starEmpty
										}
										label={
											isPinned
												? __( 'Unpin from toolbar' )
												: __( 'Pin to toolbar' )
										}
										onClick={ () =>
											setMultipleActiveAreaEnableState(
												pinnedItemsStoreKey,
												complementaryAreaIdentifier,
												! isPinned
											)
										}
										isPressed={ isPinned }
										aria-expanded={ isPinned }
									/>
								) }
							</>
						) }
					</ComplementaryAreaHeader>
					<Panel className={ panelClassName }>{ children }</Panel>
				</ComplementaryAreaFill>
			) }
		</>
	);
}

const ComplementaryAreaWrapped = withPluginContext( ( context, ownProps ) => {
	return {
		icon: ownProps.icon || context.icon,
		complementaryAreaIdentifier:
			ownProps.complementaryAreaIdentifier ||
			`${ context.name }/${ ownProps.name }`,
	};
} )( ComplementaryArea );

ComplementaryAreaWrapped.Slot = ComplementaryAreaSlot;

export default ComplementaryAreaWrapped;
