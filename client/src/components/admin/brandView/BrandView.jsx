import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
    usePublicCampaign,
    useUgcCampaign,
    useUpdatePublicMediaStatus,
    useRequestChangesPublicMedia,
    useCreatePublicFeedback
} from '@/api/apiHooks/useUgcCampaign';
import { getImgUrl } from '@/utils/image';
import BrandHeader from './components/BrandHeader';
import BrandContentGallery from './components/BrandContentGallery';
import BrandDocuments from './components/BrandDocuments';
import BrandComments from './components/BrandComments';
import ApproveModal from './components/ApproveModal';
import Deliverables from '../campingDetails/components/Deliverables';

const BrandView = () => {
    const { slug, id } = useParams();
    const isPublic = !!slug;

    const publicQuery = usePublicCampaign(slug);
    const privateQuery = useUgcCampaign(id);

    const campaign = isPublic ? publicQuery.data : privateQuery.data;
    const isLoading = isPublic ? publicQuery.isLoading : privateQuery.isLoading;

    const [activeTab, setActiveTab] = useState('Content Gallery');
    const tabs = ['Content Gallery', 'Documents', 'Comments'];

    const [requestChangesId, setRequestChangesId] = useState(null);
    const [changeText, setChangeText] = useState('');
    const [approveModal, setApproveModal] = useState({ open: false, id: null });
    const [previewItem, setPreviewItem] = useState(null);
    const [newComment, setNewComment] = useState('');

    // Mutations
    const approveMutation = useUpdatePublicMediaStatus();
    const requestMutation = useRequestChangesPublicMedia();
    const feedbackMutation = useCreatePublicFeedback();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Primary"></div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-[32px] shadow-sm">
                <p className="text-gray-400 font-bold text-base">Campaign not found</p>
            </div>
        );
    }

    const mediaItems = campaign.media || [];
    const documents = campaign.documents || [];
    const comments = campaign.feedback || [];
    const unreadComments = comments.length;

    // Handlers
    const handleApproveFile = (mediaId) => {
        setApproveModal({ open: true, id: mediaId });
    };

    const handleApproveAll = () => {
        setApproveModal({ open: true, id: 'all' });
    };

    const confirmApprove = () => {
        approveMutation.mutate({ slug: campaign.slug, mediaId: approveModal.id }, {
            onSuccess: () => {
                setApproveModal({ open: false, id: null });
            },
            onError: () => {
                setApproveModal({ open: false, id: null });
            }
        });
    };

    const handleRequestChanges = (mediaId) => {
        setRequestChangesId(mediaId);
    };

    const sendChangeRequest = () => {
        if (!changeText.trim()) return;
        requestMutation.mutate({
            slug: campaign.slug,
            mediaId: requestChangesId,
            text: changeText
        }, {
            onSuccess: () => {
                setChangeText('');
                setRequestChangesId(null);
            },
            onError: () => {
                setRequestChangesId(null);
            }
        });
    };

    const handleSendComment = () => {
        if (!newComment.trim()) return;
        feedbackMutation.mutate({
            slug: campaign.slug,
            text: newComment
        }, {
            onSuccess: () => {
                setNewComment('');
            }
        });
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <BrandHeader campaign={campaign} onApproveAll={handleApproveAll} isApprovePending={approveMutation.isPending} />

            {/* Deliverables — read-only for brand */}
            {campaign.deliverables && campaign.deliverables.length > 0 && (
                <Deliverables campaign={campaign} readOnly />
            )}

            {/* Tabs */}
            <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-0 mt-8">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative pb-3 text-sm font-bold transition-all cursor-pointer ${activeTab === tab ? 'text-Primary' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            {tab}
                            {tab === 'Comments' && unreadComments > 0 && (
                                <span className="px-2 py-0.5 bg-Primary text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[20px]">
                                    {unreadComments}
                                </span>
                            )}
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
                    releaseFiles={campaign.releaseFiles}
                    pendingApproveId={approveMutation.isPending ? approveMutation.variables?.mediaId : null}
                />
            )}

            {activeTab === 'Documents' && (
                <BrandDocuments
                    documents={documents}
                    releaseFiles={campaign.releaseFiles}
                />
            )}

            {activeTab === 'Comments' && (
                <BrandComments
                    comments={comments}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    onSend={handleSendComment}
                    onPreviewMedia={setPreviewItem}
                    isPending={feedbackMutation.isPending}
                />
            )}

            {/* Approve Confirmation Modal */}
            <ApproveModal
                isOpen={approveModal.open}
                isAll={approveModal.id === 'all'}
                onClose={() => setApproveModal({ open: false, id: null })}
                onConfirm={confirmApprove}
                isPending={approveMutation.isPending}
            />

            {/* Shared Media Preview Modal */}
            <AnimatePresence>
                {previewItem && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPreviewItem(null)}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-3xl w-full z-[1001]"
                        >
                            <button
                                onClick={() => setPreviewItem(null)}
                                className="absolute -top-10 md:-top-12 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer border border-white/20 rounded-full bg-black/20"
                            >
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                            <div
                                className="rounded-2xl overflow-hidden bg-black flex items-center justify-center relative"
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                            >
                                {previewItem.type === 'video' ? (
                                    <video src={getImgUrl(previewItem.url)} className="w-full max-h-[75vh]" controls autoPlay controlsList="nodownload" disablePictureInPicture onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} draggable="false" />
                                ) : (
                                    <img src={getImgUrl(previewItem.url)} alt={previewItem.name} className="w-full max-h-[75vh] object-contain" loading="lazy" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} draggable="false" />
                                )}
                                {!campaign?.releaseFiles && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none overflow-hidden bg-black/10">
                                        <span className="text-white/20 text-7xl font-black tracking-widest uppercase transform -rotate-45 drop-shadow-lg select-none">
                                            STAKD
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 text-center text-white">
                                <p className="font-bold text-sm">{previewItem.name}</p>
                                {previewItem.description && <p className="text-white/60 text-xs mt-1">{previewItem.description}</p>}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BrandView;