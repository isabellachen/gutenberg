/**
 * WordPress dependencies
 */
import {
	createNewPost,
	getAllBlockInserterItemTitles,
	insertBlock,
	openAllBlockInserterCategories,
	openGlobalBlockInserter,
} from '@wordpress/e2e-test-utils';

describe( 'Columns', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'restricts all blocks inside the columns block', async () => {
		await insertBlock( 'Columns' );
		const frame = await page
			.frames()
			.find( ( f ) => f.name() === 'editor-content' );
		await frame.click( '[aria-label="Two columns; equal split"]' );
		await page.click( '[aria-label="Block navigation"]' );
		const columnBlockMenuItem = (
			await page.$x(
				'//button[contains(concat(" ", @class, " "), " block-editor-block-navigation__item-button ")][text()="Column"]'
			)
		 )[ 0 ];
		await columnBlockMenuItem.click();
		await openGlobalBlockInserter();
		await openAllBlockInserterCategories();
		expect( await getAllBlockInserterItemTitles() ).toHaveLength( 0 );
	} );
} );
