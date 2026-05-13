import React, { useState } from 'react';
import BrandHeader from './components/BrandHeader';
import BrandContentGallery from './components/BrandContentGallery';
import BrandDocuments from './components/BrandDocuments';
import BrandComments from './components/BrandComments';
import ApproveModal from './components/ApproveModal';

const BrandView = () => {
    const [activeTab, setActiveTab] = useState('Content Gallery');
    const tabs = ['Content Gallery', 'Documents', 'Comments'];

    const campaign = {
        title: 'Summer Skincare Promo',
        status: 'Under Review',
        dueDate: 'Apr 20, 2026',
        daysLeft: 6,
    };

    // Content Gallery state
    const [mediaItems, setMediaItems] = useState([
        { id: 1, title: 'Nike shoe Promotion', date: 'Apr 25, 2026', type: 'image', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop', description: 'Product lifestyle shot for social campaign', status: 'pending' },
        { id: 2, title: 'Summer Skincare BTS', date: 'Apr 25, 2026', type: 'video', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop', description: 'Behind the scenes footage from the shoot', status: 'pending' },
        { id: 3, title: 'Brand Unboxing', date: 'Apr 25, 2026', type: 'image', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop', description: '', status: 'pending' },
        { id: 4, title: 'Product Demo Reel', date: 'Apr 25, 2026', type: 'video', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', description: 'Final edited version for Instagram', status: 'pending' },
        { id: 5, title: 'Lifestyle Photo Set', date: 'Apr 25, 2026', type: 'image', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', description: 'Morning routine flat lay', status: 'pending' },
        { id: 6, title: 'Testimonial Clip', date: 'Apr 25, 2026', type: 'video', url: 'https://images.unsplash.com/photo-1511499767390-90342f16b147?q=80&w=600&auto=format&fit=crop', description: 'Customer testimonial raw footage', status: 'pending' },
    ]);

    const [requestChangesId, setRequestChangesId] = useState(null);
    const [changeText, setChangeText] = useState('');
    const [approveModal, setApproveModal] = useState({ open: false, id: null });

    // Documents
    const documents = [
        { id: 1, name: 'Contract.pdf', date: 'Apr 15, 2026' },
        { id: 2, name: 'Brief.docx', date: 'Apr 10, 2026' },
    ];

    // Comments
    const [comments, setComments] = useState([
        { id: 1, from: 'brand', text: 'Change the color tone on this video', media: { title: 'Nike shoe Promotion', date: 'Apr 25, 2026', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop' } },
        { id: 2, from: 'brand', text: 'Change the color tone on this video', media: { title: 'Nike shoe Promotion', date: 'Apr 25, 2026', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop' } },
        { id: 3, from: 'creator', text: 'Sure', media: null },
    ]);
    const [newComment, setNewComment] = useState('');

    // Handlers
    const handleApproveFile = (id) => {
        setApproveModal({ open: true, id });
    };

    const handleApproveAll = () => {
        setApproveModal({ open: true, id: 'all' });
    };

    const confirmApprove = () => {
        if (approveModal.id === 'all') {
            setMediaItems(prev => prev.map(m => ({ ...m, status: 'approved' })));
            console.log('All Media Approved');
        } else {
            setMediaItems(prev => prev.map(m => m.id === approveModal.id ? { ...m, status: 'approved' } : m));
            console.log('File Approved:', approveModal.id);
        }
        setApproveModal({ open: false, id: null });
    };

    const handleRequestChanges = (id) => {
        setRequestChangesId(id);
    };

    const sendChangeRequest = () => {
        if (!changeText.trim()) return;
        const targetMedia = mediaItems.find(m => m.id === requestChangesId);
        console.log('Change Request Sent:', { id: requestChangesId, message: changeText });
        setComments(prev => [...prev, {
            id: Date.now(),
            from: 'brand',
            text: changeText,
            media: targetMedia ? { title: targetMedia.title, date: targetMedia.date, url: targetMedia.url } : null
        }]);
        setChangeText('');
        setRequestChangesId(null);
    };

    const handleSendComment = () => {
        if (!newComment.trim()) return;
        const comment = { id: Date.now(), from: 'creator', text: newComment, media: null };
        setComments(prev => [...prev, comment]);
        console.log('Comment Sent:', comment);
        setNewComment('');
    };

    const unreadComments = comments.length;

    return (
        <div className="">
            <BrandHeader campaign={campaign} onApproveAll={handleApproveAll} />

            {/* Tabs */}
            <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-0">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative pb-3 text-sm font-bold transition-all ${activeTab === tab ? 'text-Primary' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            {tab}
                            {tab === 'Comments' && <span className="w-5 h-5 bg-Primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadComments}</span>}
                        </span>
                        {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-Primary rounded-full" />}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'Content Gallery' && (
                <BrandContentGallery
                    mediaItems={mediaItems}
                    onApproveFile={handleApproveFile}
                    onRequestChanges={handleRequestChanges}
                    requestChangesId={requestChangesId}
                    changeText={changeText}
                    setChangeText={setChangeText}
                    sendChangeRequest={sendChangeRequest}
                    setRequestChangesId={setRequestChangesId}
                />
            )}

            {activeTab === 'Documents' && <BrandDocuments documents={documents} />}

            {activeTab === 'Comments' && (
                <BrandComments
                    comments={comments}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    onSend={handleSendComment}
                />
            )}

            {/* Approve Modal */}
            <ApproveModal
                isOpen={approveModal.open}
                isAll={approveModal.id === 'all'}
                onClose={() => setApproveModal({ open: false, id: null })}
                onConfirm={confirmApprove}
            />
        </div>
    );
};

export default BrandView;