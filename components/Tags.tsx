import React, { useState, useMemo } from 'react';
import type { Course, Reminder, Note } from '../types';
import Card from './Card';

type TaggedItem = (Course | Reminder | Note) & { itemType: 'Course' | 'Reminder' | 'Note' };

const ItemCard: React.FC<{ item: TaggedItem }> = ({ item }) => {
    let title: string = '';
    let details: string | React.ReactNode = '';
    
    if (item.itemType === 'Course') {
        title = (item as Course).name;
        // FIX: The Course type has 'phases', which contain 'topics'. This calculates the total topic count.
        const totalTopics = (item as Course).phases.reduce((sum, phase) => sum + phase.topics.length, 0);
        details = `${totalTopics} topics`;
    } else if (item.itemType === 'Reminder') {
        title = (item as Reminder).title;
        details = (item as Reminder).date.toLocaleDateString();
    } else if (item.itemType === 'Note') {
        title = (item as Note).title;
        details = `Last modified: ${(item as Note).lastModified}`;
    }

    return (
        <Card>
            <p className="text-xs font-semibold uppercase text-primary">{item.itemType}</p>
            <h3 className="font-semibold text-base mt-1">{title}</h3>
            <p className="text-sm text-muted mt-2">{details}</p>
        </Card>
    );
};


interface TagsProps {
    allItems: (Course | Reminder | Note)[];
}

const Tags: React.FC<TagsProps> = ({ allItems }) => {
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const { uniqueTags, taggedItems } = useMemo(() => {
        const tagMap: Map<string, TaggedItem[]> = new Map();
        const tagSet = new Set<string>();

        allItems.forEach(item => {
            // FIX: The type guard for Course was incorrect. It should check for 'phases' instead of 'topics'.
            if ('phases' in item) { // Course
                item.tags?.forEach(tag => {
                    tagSet.add(tag);
                    const items = tagMap.get(tag) || [];
                    tagMap.set(tag, [...items, { ...item, itemType: 'Course' }]);
                });
            } else if ('date' in item) { // Reminder
                 item.tags?.forEach(tag => {
                    tagSet.add(tag);
                    const items = tagMap.get(tag) || [];
                    tagMap.set(tag, [...items, { ...item, itemType: 'Reminder' }]);
                });
            } else { // Note
                 item.tags?.forEach(tag => {
                    tagSet.add(tag);
                    const items = tagMap.get(tag) || [];
                    tagMap.set(tag, [...items, { ...item, itemType: 'Note' }]);
                });
            }
        });

        return {
            uniqueTags: Array.from(tagSet).sort(),
            taggedItems: tagMap
        };
    }, [allItems]);
    
    const itemsForSelectedTag = selectedTag ? taggedItems.get(selectedTag) || [] : [];
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-base mb-6 flex items-center gap-3">
                🏷️ Tags
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <Card>
                        <h2 className="text-lg font-semibold mb-3">All Tags</h2>
                        <div className="flex flex-col items-start gap-1">
                            {uniqueTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className={`px-3 py-1 rounded-md text-sm transition-colors ${selectedTag === tag ? 'bg-primary text-white font-semibold' : 'hover:bg-primary/10'}`}
                                >
                                    #{tag} ({taggedItems.get(tag)?.length || 0})
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
                <div className="md:col-span-3">
                    <Card>
                        <h2 className="text-lg font-semibold mb-3">
                            {selectedTag ? `Items tagged with #${selectedTag}` : 'Select a tag to view items'}
                        </h2>
                        {selectedTag ? (
                             <div className="space-y-4">
                                {itemsForSelectedTag.map(item => (
                                    <ItemCard key={`${item.itemType}-${item.id}`} item={item} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted text-center py-10">No tag selected.</p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Tags;