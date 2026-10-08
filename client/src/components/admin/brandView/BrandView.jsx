import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, X, LayoutGrid, FileText, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
    usePublicCampaign,
    useMarkCampaignOpened,
    useUgcCampaign,
    useUpdatePublicMediaStatus,
    useRequestChangesPublicMedia,
    useCreatePublicFeedback,
    useRequestOtpPublic,
    useVerifyOtpPublic,
    useRatePublicCampaign
} from '@/api/apiHooks/useUgcCampaign';
import { getImgUrl } from '@/utils/image';
import BrandHeader from './components/BrandHeader';
import BrandContentGallery from './components/BrandContentGallery';
import BrandDocuments from './components/BrandDocuments';
import BrandComments from './components/BrandComments';
import ApproveModal from './components/ApproveModal';
import RatingModal from './components/RatingModal';
import Deliverables from '../campingDetails/components/Deliverables';

const BrandView = () => {
    const { slug, id } = useParams();
    const isPublic = !!slug;

    const publicQuery = usePublicCampaign(slug);
    const privateQuery = useUgcCampaign(id);

    const campaign = isPublic ? publicQuery.data : privateQuery.data;
    const isLoading = isPublic ? publicQuery.isLoading : privateQuery.isLoading;
    const markOpened = useMarkCampaignOpened();

    useEffect(() => {
        if (isPublic && slug && campaign && !campaign.authRequired && (campaign.status === 'Draft' || campaign.status === 'Active')) {
            markOpened.mutate(slug);
        }
    }, [isPublic, slug, campaign?.status, campaign?.authRequired]);

    // ── Anti-Inspect & Right-Click Protection ────────────────────────────────────
    useEffect(() => {
        const disableContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        const disableDevShortcuts = (e) => {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+Shift+I / Cmd+Option+I (Inspect)
            // Ctrl+Shift+J / Cmd+Option+J (Console)
            // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
            if (
                (e.ctrlKey || e.metaKey) &&
                e.shiftKey &&
                (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67 || e.key === 'I' || e.key === 'J' || e.key === 'C')
            ) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+U / Cmd+U (View Source)
            // Ctrl+S / Cmd+S (Save Page)
            if (
                (e.ctrlKey || e.metaKey) &&
                (e.keyCode === 85 || e.keyCode === 83 || e.key === 'u' || e.key === 's')
            ) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        // Anti-DevTools debugger loop: locks execution if DevTools is opened via browser menu
        const devToolsInterval = setInterval(() => {
            const start = performance.now();
            debugger;
            if (performance.now() - start > 100) {
                // DevTools was opened
            }
        }, 500);

        window.addEventListener('contextmenu', disableContextMenu);
        window.addEventListener('keydown', disableDevShortcuts);

        return () => {
            window.removeEventListener('contextmenu', disableContextMenu);
            window.removeEventListener('keydown', disableDevShortcuts);
            clearInterval(devToolsInterval);
        };
    }, []);

    const [activeTab, setActiveTab] = useState('Content Gallery');
    const tabs = ['Content Gallery', 'Documents', 'Comments'];

    const [requestChangesId, setRequestChangesId] = useState(null);
    const [changeText, setChangeText] = useState('');
    const [approveModal, setApproveModal] = useState({ open: false, id: null });
    const [previewItem, setPreviewItem] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [hasShownRatingForIndividual, setHasShownRatingForIndividual] = useState(false);

    // Mutations
    const approveMutation = useUpdatePublicMediaStatus();
    const rateMutation = useRatePublicCampaign();
    const requestMutation = useRequestChangesPublicMedia();
    const feedbackMutation = useCreatePublicFeedback();

    // OTP Flow State
    const [authEmail, setAuthEmail] = useState('');
    const [authOtp, setAuthOtp] = useState('');
    const [otpStep, setOtpStep] = useState(1);
    const requestOtp = useRequestOtpPublic();
    const verifyOtp = useVerifyOtpPublic();

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

    if (campaign?.authRequired) {
        return (
            <div className="flex items-center justify-center min-h-[600px] bg-gray-50/50">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold mb-2">Access Campaign</h2>
                    <p className="text-gray-500 mb-6 text-sm">Please verify your identity to access {campaign.brandName || "this campaign"}.</p>
                    
                    {otpStep === 1 ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={authEmail}
                                    onChange={(e) => setAuthEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-Primary/20"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    if (!authEmail) return;
                                    requestOtp.mutate({ slug, email: authEmail }, {
                                        onSuccess: () => setOtpStep(2)
                                    });
                                }}
                                disabled={requestOtp.isPending || !authEmail}
                                className="w-full bg-Primary text-white font-bold py-2.5 rounded-xl disabled:opacity-50"
                            >
                                {requestOtp.isPending ? 'Sending...' : 'Send Verification Code'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                                <input
                                    type="text"
                                    value={authOtp}
                                    onChange={(e) => setAuthOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-Primary/20"
                                    maxLength={6}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    if (!authOtp) return;
                                    verifyOtp.mutate({ slug, email: authEmail, otp: authOtp });
                                }}
                                disabled={verifyOtp.isPending || !authOtp}
                                className="w-full bg-Primary text-white font-bold py-2.5 rounded-xl disabled:opacity-50"
                            >
                                {verifyOtp.isPending ? 'Verifying...' : 'Verify & Access'}
                            </button>
                            <button
                                onClick={() => setOtpStep(1)}
                                className="w-full text-gray-500 text-sm font-medium hover:text-gray-700 mt-2"
                            >
                                Back to Email
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Handlers
    const handleApproveFile = (mediaId) => {
        setApproveModal({ open: true, id: mediaId });
    };

    const handleApproveAll = () => {
        setApproveModal({ open: true, id: 'all' });
    };

    const confirmApprove = () => {
        const targetMediaId = approveModal.id;
        const isApprovingAll = targetMediaId === 'all';

        approveMutation.mutate({ slug: slug, mediaId: targetMediaId }, {
            onSuccess: () => {
                setApproveModal({ open: false, id: null });

                // If campaign is already rated, do not auto-open
                if (campaign?.rating) return;

                if (isApprovingAll) {
                    // 1. "Approve All" clicked -> trigger rating modal
                    setRatingModalOpen(true);
                } else {
                    // Check if approving this item makes all media items approved
                    const currentMediaList = campaign?.media || [];
                    const remainingUnapproved = currentMediaList.filter(
                        (m) => m.id !== targetMediaId && m.status !== 'approved'
                    );

                    if (remainingUnapproved.length === 0) {
                        // 2. All files are now approved -> trigger rating modal
                        setRatingModalOpen(true);
                    } else if (!hasShownRatingForIndividual) {
                        // 3. First time individual item is approved -> trigger rating modal once
                        setRatingModalOpen(true);
                        setHasShownRatingForIndividual(true);
                    }
                    // 4. Subsequent individual approvals -> do NOT show rating modal
                }
            },
            onError: () => {
                setApproveModal({ open: false, id: null });
            }
        });
    };

    const handleRatingSubmit = ({ rating, ratingNote }) => {
        rateMutation.mutate({ slug, rating, ratingNote }, {
            onSuccess: () => {
                setRatingModalOpen(false);
            }
        });
    };

    const handleRequestChanges = (mediaId) => {
        setRequestChangesId(mediaId);
    };

    const sendChangeRequest = () => {
        if (!changeText.trim()) return;
        requestMutation.mutate({
            slug: slug,
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
            slug: slug,
            text: newComment
        }, {
            onSuccess: () => {
                setNewComment('');
            }
        });
    };


    return (
        <div className="container mx-auto px-4 py-8 select-none">
            <BrandHeader campaign={campaign} onApproveAll={handleApproveAll} isApprovePending={approveMutation.isPending} onRateCreator={() => setRatingModalOpen(true)} />

            {/* Deliverables — read-only for brand */}
            {campaign.deliverables && campaign.deliverables.length > 0 && (
                <Deliverables campaign={campaign} readOnly />
            )}

            {/* Modern Segmented Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-[#F4F6FA] border border-gray-200/70 rounded-2xl w-fit mb-8 shadow-2xs mt-8">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab;
                    let Icon = LayoutGrid;
                    let count = mediaItems.length;
                    if (tab === 'Documents') {
                        Icon = FileText;
                        count = documents.length;
                    } else if (tab === 'Comments') {
                        Icon = MessageSquare;
                        count = comments.length;
                    }

                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer select-none ${
                                isActive
                                    ? 'bg-white text-Primary shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                            }`}
                        >
                            <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-Primary' : 'text-gray-400'}`} />
                            <span>{tab}</span>
                            {count > 0 && (
                                <span
                                    className={`px-2 py-0.5 text-[10px] md:text-[11px] font-bold rounded-full transition-all ${
                                        isActive
                                            ? 'bg-Primary/10 text-Primary'
                                            : 'bg-gray-200/80 text-gray-600'
                                    }`}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
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
                    isRequestPending={requestMutation.isPending}
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
                    creator={campaign.user}
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
          <div key="preview-modal" className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setPreviewItem(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
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

            {/* Rating Modal */}
            <RatingModal
                isOpen={ratingModalOpen}
                onClose={() => setRatingModalOpen(false)}
                onSubmit={handleRatingSubmit}
                isPending={rateMutation.isPending}
                creatorName={campaign?.user?.firstName || "the creator"}
            />
        </div>
    );
};

export default BrandView;