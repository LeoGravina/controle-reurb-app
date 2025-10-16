// src/components/NucleoCardSkeleton.jsx

import React from 'react';

function NucleoCardSkeleton() {
    return (
        <div className="nucleo-card-skeleton">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line subtitle"></div>
            <div className="skeleton-body">
                <div className="skeleton-line info"></div>
                <div className="skeleton-line info"></div>
                <div className="skeleton-line info"></div>
            </div>
            <div className="skeleton-footer">
                <div className="skeleton-icon"></div>
                <div className="skeleton-icon"></div>
            </div>
        </div>
    );
}

export default NucleoCardSkeleton;