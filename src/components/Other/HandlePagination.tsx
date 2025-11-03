'use client';

import React from 'react';
import ReactPaginate from 'react-paginate';

interface Props {
    pageCount: number;
    onPageChange: (selected: number) => void;
    initialPage?: number; // 0-based page index
}

const HandlePagination: React.FC<Props> = ({ pageCount, onPageChange, initialPage }) => {
    return (
        <ReactPaginate
            previousLabel="<"
            nextLabel=">"
            pageCount={pageCount}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            onPageChange={(selectedItem) => onPageChange(selectedItem.selected)}
            forcePage={initialPage}
            containerClassName={'pagination'}
            activeClassName={'active'}
        />
    );
};

export default HandlePagination;
