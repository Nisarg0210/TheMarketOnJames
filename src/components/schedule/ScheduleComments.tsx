"use client";

import { useState } from "react";
import { addScheduleComment } from "@/app/actions/schedule";
import { Loader2, MessageSquare } from "lucide-react";

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: { name: string | null };
}

export default function ScheduleComments({
    scheduleId,
    comments
}: {
    scheduleId: string;
    comments: Comment[];
}) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        if (!formData.get("content")) return;
        setLoading(true);
        await addScheduleComment(formData);
        (document.getElementById("comment-form") as HTMLFormElement).reset();
        setLoading(false);
    }

    return (
        <div className="card mt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Team Comments
            </h3>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {comments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No comments yet.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold">{comment.user.name || "Unknown"}</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            <form id="comment-form" action={handleSubmit} className="flex gap-2">
                <input type="hidden" name="scheduleId" value={scheduleId} />
                <input
                    type="text"
                    name="content"
                    className="input flex-1"
                    placeholder="Add a comment..."
                    required
                    disabled={loading}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
                </button>
            </form>
        </div>
    );
}
