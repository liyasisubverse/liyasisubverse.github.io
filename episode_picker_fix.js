// 💬 FIREBASE COMMENT SECTION - SUBMISSION FUNCTION
async function submitEpisodeComment() {
    if (!dramaId) {
        alert("❌ කරුණාකර drama එක තෝරාගන්න!");
        return;
    }

    const nameInput = document.getElementById('commenter-name-input');
    const commentInput = document.getElementById('comment-text-input');
    
    const name = (nameInput?.value || 'Anonymous').trim();
    const text = (commentInput?.value || '').trim();

    if (!text) {
        alert("⚠️ කරුණාකර ඔබේ අදහස ලියන්න!");
        return;
    }

    const commentData = {
        name: name,
        text: text,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0
    };

    try {
        const commentUrl = `${firebaseURL}episode_comments/${dramaId}.json`;
        const response = await fetch(commentUrl, {
            method: 'POST',
            body: JSON.stringify(commentData)
        });

        if (response.ok) {
            alert("✅ ඔබේ අදහස සફලව ඇතුළු කරන ලදී! ❤️");
            
            // Clear input fields
            if (nameInput) nameInput.value = '';
            if (commentInput) commentInput.value = '';
            
            // Reload comments
            await loadComments();
        } else {
            alert("❌ අදහස යැවීමේ දෝෂයක් සිදුවිය!");
        }
    } catch (error) {
        console.error("Error submitting comment:", error);
        alert("❌ Network error. කරුණාකර නැවත උත්සාහ කරන්න!");
    }
}

// 💬 FIREBASE COMMENT LOADING FUNCTION (Improved)
async function loadComments() {
    if (!dramaId) return;
    const container = document.getElementById('comments-list-container');
    if (!container) return;

    try {
        const commentUrl = `${firebaseURL}episode_comments/${dramaId}.json`;
        const response = await fetch(commentUrl);
        
        if (!response.ok) throw new Error("Failed to load comments");
        
        const data = await response.json();
        container.innerHTML = ''; // Clear previous comments

        if (!data || Object.keys(data).length === 0) {
            container.innerHTML = '<p style="font-size:12px; color:var(--text-muted);">තවම අදහස නැත. පළමු අදහස ලියන්න!</p>';
            return;
        }

        // Sort comments by timestamp (newest first)
        const commentArray = Object.entries(data).map(([id, comment]) => ({
            id,
            ...comment
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Display comments
        commentArray.forEach(comment => {
            const card = document.createElement('div');
            card.className = 'comment-card';
            
            const date = new Date(comment.timestamp);
            const formattedDate = date.toLocaleDateString('si-LK') + ' ' + date.toLocaleTimeString('si-LK');
            
            card.innerHTML = `
                <div class="comment-header">
                    <span>${comment.name || 'Anonymous'}</span>
                    <span>${formattedDate}</span>
                </div>
                <div class="comment-body">${escapeHtml(comment.text)}</div>
                <div style="margin-top: 10px; font-size: 11px; display: flex; gap: 10px;">
                    <button onclick="likeComment('${dramaId}', '${comment.id}')" style="background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3); color: var(--neon-cyan); padding: 4px 8px; border-radius: 4px; cursor: pointer;">
                        👍 <span class="like-count">${comment.likes || 0}</span>
                    </button>
                    <button onclick="dislikeComment('${dramaId}', '${comment.id}')" style="background: rgba(255,0,127,0.1); border: 1px solid rgba(255,0,127,0.3); color: var(--neon-pink); padding: 4px 8px; border-radius: 4px; cursor: pointer;">
                        👎 <span class="dislike-count">${comment.dislikes || 0}</span>
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading comments:", error);
        container.innerHTML = '<p style="font-size:12px; color:var(--text-muted);">❌ අදහස පූරණයේ දෝෂයක්!</p>';
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 👍 Like comment function
async function likeComment(dramaId, commentId) {
    try {
        const likeUrl = `${firebaseURL}episode_comments/${dramaId}/${commentId}/likes.json`;
        const response = await fetch(likeUrl);
        let likes = 0;
        
        if (response.ok) {
            const val = await response.json();
            if (val !== null) likes = parseInt(val) || 0;
        }
        
        likes++;
        
        await fetch(likeUrl, {
            method: 'PUT',
            body: JSON.stringify(likes)
        });
        
        await loadComments();
    } catch (error) {
        console.error("Error liking comment:", error);
    }
}

// 👎 Dislike comment function
async function dislikeComment(dramaId, commentId) {
    try {
        const dislikeUrl = `${firebaseURL}episode_comments/${dramaId}/${commentId}/dislikes.json`;
        const response = await fetch(dislikeUrl);
        let dislikes = 0;
        
        if (response.ok) {
            const val = await response.json();
            if (val !== null) dislikes = parseInt(val) || 0;
        }
        
        dislikes++;
        
        await fetch(dislikeUrl, {
            method: 'PUT',
            body: JSON.stringify(dislikes)
        });
        
        await loadComments();
    } catch (error) {
        console.error("Error disliking comment:", error);
    }
}
